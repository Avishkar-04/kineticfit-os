# KineticFit OS - Terraform Infrastructure as Code

This directory provides two infrastructure definitions:
1. **`modules/kind-local`**: An applyable local development configuration that provisions a multi-node Kubernetes `kind` cluster with Ingress-Nginx, Argo Rollouts, and the KineticFit Helm release.
2. **`modules/aws-reference`**: A validated production-grade AWS multi-region reference architecture (EKS 1.29, Aurora Serverless v2 PostgreSQL, ElastiCache Redis, S3 + CloudFront CDN + WAFv2, Route 53 health check failover).

---

## Remote State & State Locking

In production, Terraform state is stored remotely with cryptographic state locking:

```hcl
terraform {
  backend "s3" {
    bucket         = "kineticfit-terraform-state-prod"
    key            = "platform/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "kineticfit-terraform-locks"
    encrypt        = true
  }
}
```

- **S3 Bucket**: Versioning enabled, Server-Side Encryption (KMS), Public Access Blocked.
- **DynamoDB**: Primary key `LockID` (String) preventing concurrent `terraform apply` race conditions.

---

## Local Validation Drill

Run the validation suite locally:

```bash
cd deploy/terraform/modules/kind-local
terraform init -backend=false
terraform validate
```

For AWS Reference Architecture:
```bash
cd deploy/terraform/modules/aws-reference
terraform init -backend=false
terraform validate
```

---

## Cost Optimization Notes
- **EKS Spot Instances**: Worker node pool uses `capacity_type = "SPOT"` across diverse instance families (`t3.xlarge`, `m5.xlarge`, `c5.xlarge`) reducing compute costs by up to 70%.
- **Aurora Serverless v2**: ACU scales dynamically between `0.5` and `16.0` ACUs based on gym traffic (low night baseline, peak at 18:00–19:00).

