const mongoose = require('mongoose');

const fileMappingRuleSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true, maxlength: 500 },
  module: { type: String, required: true, enum: ['SAL', 'UPL', 'OWB', 'IWB', 'MAS'], trim: true },
  enabled: { type: Boolean, default: true },
  priority: { type: Number, required: true, min: 1, max: 1000, default: 1 },
  schedule: {
    period: { type: String, enum: ['daily', 'weekly', 'monthly', 'adhoc'], default: 'adhoc', required: true },
    weekday: { type: Number, min: 0, max: 6, default: undefined },
    monthday: { type: Number, min: 1, max: 31, default: undefined }
  },
  matchType: { type: String, enum: ['filename', 'filetype'], default: 'filename', required: true },
  source: {
    directory: { type: String, required: true, trim: true },
    pattern: { type: String, required: function() { return this.matchType === 'filename'; }, trim: true },
    fileTypeConfig: { type: mongoose.Schema.Types.ObjectId, ref: 'FileTypeConfig', required: function() { return this.matchType === 'filetype'; } }
  },
  destination: {
    path: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true },
    conflict: { type: String, enum: ['overwrite', 'rename', 'skip'], default: 'rename' }
  },
  retry: {
    attempts: { type: Number, min: 0, max: 10, default: 3 },
    delay: { type: String, enum: ['linear', 'exponential'], default: 'exponential' }
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true }
}, { timestamps: true, collection: 'file_mapping_rules' });

fileMappingRuleSchema.pre('save', function(next) { this.updated = new Date(); next(); });

fileMappingRuleSchema.index({ enabled: 1, priority: -1 });
fileMappingRuleSchema.index({ createdBy: 1 });
fileMappingRuleSchema.index({ created: -1 });

const FileMappingRule = mongoose.models.FileMappingRule || mongoose.model('FileMappingRule', fileMappingRuleSchema, 'file_mapping_rules');

module.exports = { FileMappingRule };


