terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.5.1"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.29.0"
    }
  }
}

provider "kind" {}

resource "kind_cluster" "kineticfit_local" {
  name           = var.cluster_name
  node_image     = "kindest/node:v1.29.2"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
      kubeadm_config_patches = [
        "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
      ]
      extra_port_mappings {
        container_port = 80
        host_port      = 80
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 443
        host_port      = 443
        protocol       = "TCP"
      }
    }

    node {
      role = "worker"
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.kineticfit_local.endpoint
  client_certificate     = kind_cluster.kineticfit_local.client_certificate
  client_key             = kind_cluster.kineticfit_local.client_key
  cluster_ca_certificate = kind_cluster.kineticfit_local.cluster_ca_certificate
}

provider "helm" {
  kubernetes {
    host                   = kind_cluster.kineticfit_local.endpoint
    client_certificate     = kind_cluster.kineticfit_local.client_certificate
    client_key             = kind_cluster.kineticfit_local.client_key
    cluster_ca_certificate = kind_cluster.kineticfit_local.cluster_ca_certificate
  }
}

# Ingress Nginx Controller
resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true
  version          = "4.10.0"

  set {
    name  = "controller.hostPort.enabled"
    value = "true"
  }

  set {
    name  = "controller.service.type"
    value = "NodePort"
  }

  depends_on = [kind_cluster.kineticfit_local]
}

# Argo Rollouts Controller
resource "helm_release" "argo_rollouts" {
  name             = "argo-rollouts"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-rollouts"
  namespace        = "argo-rollouts"
  create_namespace = true
  version          = "2.35.0"

  set {
    name  = "dashboard.enabled"
    value = "true"
  }

  depends_on = [kind_cluster.kineticfit_local]
}

# KineticFit OS Application Release
resource "helm_release" "kineticfit" {
  name             = "kineticfit"
  chart            = "../../../helm/kineticfit"
  namespace        = "kineticfit"
  create_namespace = true

  values = [
    yamlencode({
      global = {
        environment = "development"
        domain      = "kineticfit.local"
      }
      database = {
        host = "postgres-primary.kineticfit.svc.cluster.local"
        port = 5432
        name = "kineticfit"
        user = "kinetic_app"
      }
      redis = {
        url = "redis://redis-master.kineticfit.svc.cluster.local:6379"
      }
      rabbitmq = {
        url = "amqp://kinetic_user:kinetic_secret@rabbitmq.kineticfit.svc.cluster.local:5672"
      }
      services = {
        auth = { replicas = 1 }
        member = { replicas = 1 }
        scheduling = { replicas = 1 }
        access = { replicas = 1 }
        nutrition = { replicas = 1 }
        billing = { replicas = 1 }
        web = { replicas = 1 }
      }
    })
  ]

  depends_on = [helm_release.ingress_nginx, helm_release.argo_rollouts]
}
