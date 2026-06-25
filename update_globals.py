import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'const { width } = Dimensions.get("window");' in line:
        lines[i] = 'const { width, height: screenHeight } = Dimensions.get("window");\n'
        lines.insert(i + 1, 'const isDesktop = width > 1024;\n')
        lines.insert(i + 2, 'const isTablet = width > 768;\n')
        lines.insert(i + 3, 'const MAX_WIDTH = 1280;\n')
        lines.insert(i + 4, 'const CONTENT_PADDING = isDesktop ? 40 : 16;\n')
        break

# Add a ResponsiveContainer helper component before AuthScreen
for i, line in enumerate(lines):
    if 'function AuthScreen' in line:
        lines.insert(i, 'const ResponsiveContainer = ({ children, style = {} }) => (\n  <View style={[{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: CONTENT_PADDING }, style]}>\n    {children}\n  </View>\n);\n\n')
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
