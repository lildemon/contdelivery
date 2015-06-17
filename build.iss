; -- Example1.iss --
; Demonstrates copying 3 files and creating an icon.

; SEE THE DOCUMENTATION FOR DETAILS ON CREATING .ISS SCRIPT FILES!

[Setup]
AppName=Start Point
AppVersion=0.0.1
DefaultDirName={pf}\StartPoint
DefaultGroupName=StartPoint
UninstallDisplayIcon={app}\nw.exe
Compression=lzma2
SolidCompression=yes
OutputDir=SetupOutput

[Files]
Source: "F:\ContDeliveryReleaseV3\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
;Source: "MyProg.chm"; DestDir: "{app}"
;Source: "Readme.txt"; DestDir: "{app}"; Flags: isreadme

[Registry]
;http://stackoverflow.com/questions/13567119/inno-setup-registry-entry-for-custom-url-protocol
Root: HKCR; Subkey: "Directory\shell\startpoint"; ValueType: "string"; ValueData: "在此目录新建或打开项目"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\shell\startpoint"; ValueType: "string"; ValueName: "Icon"; ValueData: """{app}\nw.exe"",0"""
Root: HKCR; Subkey: "Directory\shell\startpoint\command"; ValueType: "string"; ValueData: """{app}\nw.exe"" ""%1"""

Root: HKCR; Subkey: "Directory\Background\shell\startpoint"; ValueType: "string"; ValueData: "在此目录新建或打开项目"; Flags: uninsdeletekey
Root: HKCR; Subkey: "Directory\Background\shell\startpoint"; ValueType: "string"; ValueName: "Icon"; ValueData: """{app}\nw.exe"",0"""
Root: HKCR; Subkey: "Directory\Background\shell\startpoint\command"; ValueType: "string"; ValueData: """{app}\nw.exe"" ""%V"""

[Run]
Filename: "{app}\nw.exe"; Description: "立即运行"; Flags: postinstall

[Icons]
Name: "{group}\StartPoint"; Filename: "{app}\nw.exe"
Name: "{commondesktop}\StartPoint"; Filename: "{app}\nw.exe"
Name: "{group}\卸载"; Filename: "{uninstallexe}"