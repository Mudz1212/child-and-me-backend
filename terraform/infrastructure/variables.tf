variable "azure_ssh_public_key" {
  default = "keys/default-vm-ssh.pub"
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "db_user" {
  type    = string
  default = "pgadmin"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type    = string
  default = "child_and_me"
}