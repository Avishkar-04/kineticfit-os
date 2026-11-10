terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40.0"
    }
  }
}

# -----------------------------------------------------------------------------
# VPC & Networking (Primary Region: us-east-1)
# -----------------------------------------------------------------------------
resource "aws_vpc" "primary" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "kineticfit-vpc-primary"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.primary.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name                              = "kineticfit-private-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.primary.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
  availability_zone       = element(var.availability_zones, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name                     = "kineticfit-public-subnet-${count.index + 1}"
    "kubernetes.io/role/elb" = "1"
  }
}

# -----------------------------------------------------------------------------
# AWS EKS Cluster (Managed Kubernetes with Spot Nodes for Cost Optimization)
# -----------------------------------------------------------------------------
resource "aws_iam_role" "eks_cluster" {
  name = "kineticfit-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_eks_cluster" "primary" {
  name     = "kineticfit-${var.environment}"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.29"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [aws_iam_role.eks_cluster]
}

resource "aws_eks_node_group" "spot_workers" {
  cluster_name    = aws_eks_cluster.primary.name
  node_group_name = "kineticfit-spot-pool"
  node_role_arn   = aws_iam_role.eks_cluster.arn
  subnet_ids      = aws_subnet.private[*].id

  capacity_type  = "SPOT"
  instance_types = ["t3.xlarge", "m5.xlarge", "c5.xlarge"]

  scaling_config {
    desired_size = 4
    max_size     = 12
    min_size     = 2
  }

  labels = {
    role = "application-workload"
  }
}

# -----------------------------------------------------------------------------
# Amazon Aurora PostgreSQL (Multi-AZ with Cross-Region Replica)
# -----------------------------------------------------------------------------
resource "aws_rds_cluster" "aurora_primary" {
  cluster_identifier      = "kineticfit-aurora-primary"
  engine                  = "aurora-postgresql"
  engine_version          = "16.1"
  database_name           = "kineticfit"
  master_username         = "kinetic_admin"
  master_password         = var.db_password
  backup_retention_period = 30
  preferred_backup_window = "02:00-03:00"
  storage_encrypted       = true
  deletion_protection     = true
  apply_immediately       = false

  serverlessv2_scaling_configuration {
    max_capacity = 16.0
    min_capacity = 0.5
  }
}

resource "aws_rds_cluster_instance" "aurora_primary_instances" {
  count              = 2
  identifier         = "kineticfit-aurora-inst-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora_primary.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora_primary.engine
  engine_version     = aws_rds_cluster.aurora_primary.engine_version
}

# -----------------------------------------------------------------------------
# Amazon ElastiCache Redis (Multi-AZ Replication Group)
# -----------------------------------------------------------------------------
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "kineticfit-redis"
  description                = "KineticFit Redis Replication Group"
  node_type                  = "cache.m7g.large"
  num_cache_clusters         = 3
  port                       = 6379
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auto_minor_version_upgrade = true
}

# -----------------------------------------------------------------------------
# S3 Media Storage & CloudFront CDN with WAFv2
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket = "kineticfit-assets-${var.environment}"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-kineticfit-assets"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-kineticfit-assets"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# -----------------------------------------------------------------------------
# Route 53 DNS with Active-Passive Failover
# -----------------------------------------------------------------------------
resource "aws_route53_health_check" "primary_gateway" {
  fqdn              = "api.kineticfit.os"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health/ready"
  failure_threshold = "3"
  request_interval  = "10"
}
