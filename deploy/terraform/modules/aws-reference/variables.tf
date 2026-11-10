variable "environment" {
  description = "Deployment target environment (staging/production)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the AWS VPC"
  type        = string
  default     = "10.100.0.0/16"
}

variable "availability_zones" {
  description = "List of AWS Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "db_password" {
  description = "Master password for Aurora Postgres cluster"
  type        = string
  sensitive   = true
  default     = "AuroraPostgresSuperSecretPassword2026!"
}
