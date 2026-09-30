terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-tfstate-child-and-me"
    storage_account_name = "stchildandmema"
    container_name       = "tfstate"
    key                  = "prod/infrastructure/backend-state.tfstate"
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "vm_resource_group" {
  name     = "rg-final-project-child-and-me"
  location = "swedencentral"
}

resource "azurerm_linux_virtual_machine" "http_server" {
  name                  = "http-server"
  resource_group_name   = azurerm_resource_group.vm_resource_group.name
  location              = azurerm_resource_group.vm_resource_group.location
  size                  = "Standard_D2ls_v5"
  admin_username        = "azureuser"
  network_interface_ids = [azurerm_network_interface.http_server_nic.id]
  custom_data           = base64encode(file("${path.module}/cloud-init.yaml"))

  admin_ssh_key {
    username   = "azureuser"
    public_key = file(var.azure_ssh_public_key)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = data.azurerm_platform_image.ubuntu_latest.version
  }
}

resource "azurerm_service_plan" "app_plan" {
  name                = "child-and-me-plan"
  resource_group_name = azurerm_resource_group.vm_resource_group.name
  location            = azurerm_resource_group.vm_resource_group.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "server" {
  name                = "child-and-me-server"
  resource_group_name = azurerm_resource_group.vm_resource_group.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    application_stack {
      docker_image_name   = "mudz1212/child-and-me-server-cloud:latest"
      docker_registry_url = "https://index.docker.io"
    }
  }

  app_settings = {
    JWT_SECRET  = var.jwt_secret
    DB_HOST     = azurerm_postgresql_flexible_server.db.fqdn
    DB_USER     = var.db_user
    DB_PASSWORD = var.db_password
    DB_NAME     = var.db_name
    DB_PORT     = "5432"
    PORT        = "80"
  }
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "child-and-me-db"
  resource_group_name    = azurerm_resource_group.vm_resource_group.name
  location               = azurerm_resource_group.vm_resource_group.location
  version                = "16"
  administrator_login    = "pgadmin"
  administrator_password = var.db_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
}

resource "azurerm_postgresql_flexible_server_database" "child_and_me" {
  name      = "child_and_me"
  server_id = azurerm_postgresql_flexible_server.db.id
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

output "app_url" {
  value = "https://${azurerm_linux_web_app.server.default_hostname}"
}