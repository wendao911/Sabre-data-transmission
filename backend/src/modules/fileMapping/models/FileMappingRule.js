const mongoose = require('mongoose');

const fileMappingRuleSchema = new mongoose.Schema({
  // 基本信息
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  module: {
    type: String,
    required: true,
    enum: ['SAL', 'UPL', 'OWB', 'IWB', 'MAS'],
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
    default: 1
  },

  // 周期配置
  schedule: {
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'adhoc'],
      default: 'adhoc',
      required: true
    },
    weekdays: {
      type: [Number], // 0-6: 周日-周六
      default: undefined
    },
    monthDays: {
      type: [Number], // 1-31
      default: undefined
    }
  },
  
  // 源文件匹配条件
  source: {
    directory: {
      type: String,
      required: true,
      trim: true
    },
    pattern: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // 目标路径配置
  destination: {
    path: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    conflict: {
      type: String,
      enum: ['overwrite', 'rename', 'skip'],
      default: 'rename'
    }
  },
  
  // 重试配置
  retry: {
    attempts: {
      type: Number,
      min: 0,
      max: 10,
      default: 3
    },
    delay: {
      type: String,
      enum: ['linear', 'exponential'],
      default: 'exponential'
    }
  },
  
  // 元数据
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// 更新时自动设置 updated 字段
fileMappingRuleSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

// 索引
fileMappingRuleSchema.index({ enabled: 1, priority: -1 });
fileMappingRuleSchema.index({ createdBy: 1 });
fileMappingRuleSchema.index({ created: -1 });

module.exports = mongoose.model('FileMappingRule', fileMappingRuleSchema, 'file_mapping_rules');
