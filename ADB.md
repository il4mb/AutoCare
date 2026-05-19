# ADB COMMAND IN THIS PROJECT

## Switch the device to TCP mode
```shell
adb -s <ID> tcpip 5555
# adb -s QV7109TR1V tcpip 5555
```

## Connect via Wi-FI
```shell
adb connect <IP>:5555
# adb connect 192.168.100.52:5555
```