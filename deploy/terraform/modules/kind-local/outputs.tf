output "cluster_name" {
  description = "The name of the provisioned kind cluster"
  value       = kind_cluster.kineticfit_local.name
}

output "kubeconfig_endpoint" {
  description = "Kubernetes API server endpoint"
  value       = kind_cluster.kineticfit_local.endpoint
}
