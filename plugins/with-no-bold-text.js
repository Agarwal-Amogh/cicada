// Android's Bold text setting (Samsung's "Bold font") cut labels short:
// React Native measured text as if bolder, then drew it in our own fonts,
// which have no bolder version to switch to, so "Following" lost its last
// letters and labels ended in "…" (Decision 0069). The screen ignores that
// setting, so text is measured and drawn alike. Our fonts already set their
// own weights. Only the activity: overriding the app context as well kept a
// font size changed while the app was open from applying.

const { withMainActivity } = require('expo/config-plugins');

const IMPORTS = ['android.content.Context', 'android.content.res.Configuration', 'android.os.Build'];

const OVERRIDE = `
  // Bold text off for this screen (plugins/with-no-bold-text.js).
  override fun attachBaseContext(base: Context) {
    val config = base.resources.configuration
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && config.fontWeightAdjustment != 0) {
      val plain = Configuration(config).apply { fontWeightAdjustment = 0 }
      super.attachBaseContext(base.createConfigurationContext(plain))
    } else {
      super.attachBaseContext(base)
    }
  }
`;

function addOverride(source) {
  if (source.includes('fontWeightAdjustment')) return source;
  let out = source;
  for (const name of IMPORTS) {
    if (!out.includes(`import ${name}\n`)) out = out.replace(/^(package [^\n]+\n)/, `$1import ${name}\n`);
  }
  // Inside the class, after its opening line.
  return out.replace(/(class MainActivity[^{]*\{\n)/, `$1${OVERRIDE}`);
}

module.exports = function withNoBoldText(config) {
  return withMainActivity(config, (mod) => {
    mod.modResults.contents = addOverride(mod.modResults.contents);
    return mod;
  });
};
