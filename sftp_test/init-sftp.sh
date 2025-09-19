#!/bin/bash

# 创建 SFTP 目录结构
echo "Creating SFTP directory structure..."

# 创建主目录
mkdir -p /home/testuser/SAL
mkdir -p /home/testuser/UPL
mkdir -p /home/testuser/OWB
mkdir -p /home/testuser/IWB
mkdir -p /home/testuser/MAS

# 设置权限
chown -R testuser:testuser /home/testuser
chmod -R 755 /home/testuser

# 创建一些示例文件
echo "SAL test file" > /home/testuser/SAL/sal-test.txt
echo "UPL test file" > /home/testuser/UPL/upl-test.txt
echo "OWB test file" > /home/testuser/OWB/owb-test.txt
echo "IWB test file" > /home/testuser/IWB/iwb-test.txt
echo "MAS test file" > /home/testuser/MAS/mas-test.txt

echo "SFTP directory structure created successfully!"
echo "Directories: SAL, UPL, OWB, IWB, MAS"
