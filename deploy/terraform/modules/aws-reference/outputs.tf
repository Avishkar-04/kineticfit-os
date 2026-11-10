output "vpc_id" {
  description = "Primary VPC identifier"
  value       = aws_vpc.primary.id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.primary.name
}

output "eks_cluster_endpoint" {
  description = "EKS API endpoint"
  value       = aws_eks_cluster.primary.endpoint
}

output "aurora_endpoint" {
  description = "Aurora PostgreSQL primary cluster endpoint"
  value       = aws_rds_cluster.aurora_primary.endpoint
}

output "cloudfront_distribution_domain" {
  description = "CloudFront CDN domain name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}
