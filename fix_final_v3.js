const fs = require('fs');
let content = fs.readFileSync('WantokWorkforce.js', 'utf8');

const targetTrailing = `            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
              {worker?.distance_km ? worker.distance_km + " km away" : worker?.location_name || "Nearby"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default WantokWorkforce;`;

const lines = content.split('\n');
// We want to replace from where it started to go wrong, which was after line 2211 (cat -n shows it as 34 in my tail output).
// cat -n showed 34: <Text style={{ fontSize: 12 }}>📍</Text>
// index for that line was 2210.

const newLines = lines.slice(0, 2211);
const finalContent = newLines.join('\n') + '\n' + targetTrailing;

fs.writeFileSync('WantokWorkforce.js', finalContent);
