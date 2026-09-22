resource "azurerm_virtual_network" "vm_vnet" {
  name                = "vnet-child-and-me"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.vm_resource_group.location
  resource_group_name = azurerm_resource_group.vm_resource_group.name
}

resource "azurerm_subnet" "public_subnets" {
  name                 = "subnet-public"
  resource_group_name  = azurerm_resource_group.vm_resource_group.name
  virtual_network_name = azurerm_virtual_network.vm_vnet.name
  address_prefixes     = ["10.0.0.0/24"]
}

resource "azurerm_public_ip" "http_server_pip" {
  name                = "pip-http-server"
  location            = azurerm_resource_group.vm_resource_group.location
  resource_group_name = azurerm_resource_group.vm_resource_group.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "http_server_nic" {
  name                = "nic-http-server"
  location            = azurerm_resource_group.vm_resource_group.location
  resource_group_name = azurerm_resource_group.vm_resource_group.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.public_subnets.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.http_server_pip.id
  }
}

resource "azurerm_network_interface_security_group_association" "http_server_nic_nsg" {
  network_interface_id      = azurerm_network_interface.http_server_nic.id
  network_security_group_id = azurerm_network_security_group.http_server_nsg.id
}