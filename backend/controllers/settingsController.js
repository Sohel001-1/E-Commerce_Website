import settingsModel from "../models/settingsModel.js";

// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne();
    if (!settings) {
      // Seed default settings if none exist
      settings = await settingsModel.create({
        insideChittagongFee: 60,
        outsideChittagongFee: 120,
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// @route   POST /api/settings
const updateSettings = async (req, res) => {
  try {
    const { insideChittagongFee, outsideChittagongFee } = req.body;
    let settings = await settingsModel.findOne();
    
    if (!settings) {
      settings = new settingsModel({ insideChittagongFee, outsideChittagongFee });
    } else {
      settings.insideChittagongFee = insideChittagongFee;
      settings.outsideChittagongFee = outsideChittagongFee;
    }
    
    await settings.save();
    res.json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getSettings, updateSettings };
