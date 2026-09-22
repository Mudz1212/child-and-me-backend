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