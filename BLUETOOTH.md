# MOCK BLUETOOTH CONNECTION

this project are using mock bluetooth connection running on local tcp that forwared to adb emulator

## ELM327 Emulator
the virtual bluetooth ECU device, this module are repressent the ECU car.

```bash
./elm327-emulator.exe -s car -n 35000
```
## Android Debug Bridge (ADB)
PC terminal and redirect the Android emulator network layer to look at your host PC's script:

```bash
adb forward tcp:35000 tcp:35000
```

OR

```bash
adb reverse tcp:35000 tcp:35000
```

## The Mock ICU "Cheat Sheet"
Use these with the `edit <KEY> 0 <HEX>` command in your emulator to simulate various car conditions.

### 1. Driving Dynamics (The Essentials)

These are the core PIDs for any dashboard or logging application.

| Sensor | Key Name | Hex Example | Result |
| --- | --- | --- | --- |
| **Engine RPM** | `RPM` | `09 C4` | **625 RPM** (Idle) |
| **Engine RPM** | `RPM` | `4E 20` | **5000 RPM** (High Rev) |
| **Vehicle Speed** | `SPEED` | `00` | **0 km/h** |
| **Vehicle Speed** | `SPEED` | `50` | **80 km/h** |
| **Throttle Pos** | `THROTTLE_POS` | `FF` | **100%** (Wide Open) |
| **Fuel Level** | `FUEL_LEVEL` | `80` | **50%** Tank |

---

### 2. Thermal & Environment (Testing Gauges)

Useful for testing "Warning" or "Redline" UI states in your app.

| Sensor | Key Name | Hex Example | Result |
| --- | --- | --- | --- |
| **Coolant Temp** | `COOLANT_TEMP` | `5A` | **50°C** (Cold) |
| **Coolant Temp** | `COOLANT_TEMP` | `96` | **110°C** (Overheating) |
| **Intake Temp** | `INTAKE_TEMP` | `46` | **30°C** (Ambient) |
| **Ambient Temp** | `AMBIENT_TEMP` | `3C` | **20°C** |

---

### 3. Diagnostic & Status (Logic Testing)

To test how your app handles trouble codes and vehicle "Readiness."

| State | Command | Effect |
| --- | --- | --- |
| **Check Engine ON** | `edit MIL_STATUS 0 80` | Sets the "Malfunction Indicator Lamp" to active. |
| **Clear All Edits** | `reset` | Wipes your manual `edit` overrides back to default. |
| **Simulate DTC** | `edit DTC 0 43 01 03 00 00 00` | Mocks a **P0300** Random Misfire code. |

---

### 4. Adapter "AT" Commands (Protocol Testing)

In your `BleObdService.ts`, you might send these to initialize the connection. The emulator will respond to these automatically:

* **`AT Z`**: Reset the ELM327.
* **`AT RV`**: Read the battery voltage (Returns something like `12.6V`).
* **`AT DP`**: Describe current protocol (Returns `CAN 11/500`).
* **`AT SP 0`**: Search and set protocol to automatic.

---

### 5. Advanced Mocking: The "Noise" Command

If you want the data to feel "alive" rather than static, use the **`choice`** command in the emulator. This tells the emulator to pick from a list of values every time your app polls:

```bash
# This makes the RPM flicker between 800 and 820 like a real vibrating engine
edit RPM 0 ["0C 80", "0C 88", "0C 90"]
choice RPM random

```

### Pro-Tip for your TypeScript Decoder:

When you receive the data from `edit RPM 0 2E E0`, your app gets `41 0C 2E E0`.
Remember that `2E` is byte **A** and `E0` is byte **B**.

**Formula:**
$((parseInt("2E", 16) \times 256) + parseInt("E0", 16)) / 4$

Would you like a TypeScript snippet that automatically maps these specific keys (RPM, Speed, Temp) based on this cheat sheet?

## Using the Diagnostics Panel (in-app)

During testing with the ELM327 emulator you can use the provided `DiagnosticsPanel` component to connect to the emulator (TCP `127.0.0.1:35000`) and view parsed PID values.

1. Start the emulator, e.g.:

```bash
./elm327-emulator.exe -s car -n 35000
```

2. Forward the port to the Android emulator if needed:

```bash
adb forward tcp:35000 tcp:35000
```

3. Open the app and navigate to the screen that mounts `DiagnosticsPanel` (you can import it from `src/components/DiagnosticsPanel.tsx`).

4. Tap `Connect (Mock)`, then `Request Core PIDs` to poll RPM, Speed, Coolant Temp, Throttle, and Fuel Level.
