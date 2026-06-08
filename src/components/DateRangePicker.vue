<template>
  <van-popup 
    v-model="innerShow" 
    position="bottom"
    round
  >
    <div class="date-range-picker">
      <div class="operate-box">
        <div 
          @click="touchSelect(0)" 
          class="time-item" 
          :class="{ active: touchIndex === 0 }"
        >
          <div class="label">{{ startText }}</div>
          <div class="date">{{ resultDate[0] }}</div>
        </div>
        <div class="divider-text">至</div>
        <div 
          @click="touchSelect(1)" 
          class="time-item" 
          :class="{ active: touchIndex === 1 }"
        >
          <div class="label">{{ endText }}</div>
          <div class="date">{{ resultDate[1] }}</div>
        </div>
      </div>

      <van-picker
        ref="datePicker"
        :columns="pickerColumns"
        :default-values="currentPickerValues"
        @change="onPickerChange"
        @confirm="pickerConfirm"
        @cancel="close"
        :show-toolbar="false"
        :item-height="50"
        :visible-item-count="5"
        class="picker-container"
      />
    </div>
    
    <!-- 底部按钮区域 -->
    <div class="button-group">
      <div class="btn cancel-btn" @click="close">取消</div>
      <div class="btn confirm-btn" @click="pickerConfirm">确认</div>
    </div>
  </van-popup>
</template>

<script>
import { Picker, Popup, Toast } from 'vant';

export default {
  name: 'DateRangePicker',
  components: {
    [Picker.name]: Picker,
    [Popup.name]: Popup,
  },
  props: {
    // 控制弹窗显示隐藏
    show: {
      type: Boolean,
      default: false
    },
    defaultDate: {
      type: Array,
      default: () => []
    },
    minYear: {
      type: Number,
      default: 2000,
    },
    maxYear: {
      type: Number,
      default: null,
    },
    startText: {
      type: String,
      default: '开始日期'
    },
    endText: {
      type: String,
      default: '结束日期'
    }
  },
  data() {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDay = date.getDate();

    // 生成年份选项
    const years = [];
    const maxYear = this.maxYear || currentYear;
    for (let i = this.minYear; i <= maxYear; i++) {
      years.push(i);
    }

    // 生成月份选项
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(this.padStart(i));
    }

    return {
      innerShow: false,
      touchIndex: 0,
      currentYear,
      currentMonth,
      currentDay,
      years,
      months,
      days: [],
      resultDate: [],
      lastConfirmedDate: [],
      // 用于Vant Picker的列配置
      pickerColumns: []
    };
  },
  computed: {
    // 计算当前选中的picker值
    currentPickerValues() {
      if (this.resultDate.length === 0) {
        return [];
      }
      
      const currentDate = this.resultDate[this.touchIndex];
      if (!currentDate) {
        return [];
      }
      
      const parts = currentDate.split('-');
      if (parts.length !== 3) {
        return [];
      }
      
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      // 查找索引
      const yearIndex = this.years.indexOf(year);
      const monthIndex = this.months.indexOf(this.padStart(month));
      const dayIndex = this.days.indexOf(this.padStart(day));
      
      // 构建显示值
      const displayValues = [];
      if (yearIndex !== -1) {
        displayValues[0] = this.years[yearIndex] + '年';
      }
      if (monthIndex !== -1) {
        displayValues[1] = this.months[monthIndex] + '月';
      }
      if (dayIndex !== -1) {
        displayValues[2] = this.days[dayIndex] + '日';
      }
      
      return displayValues;
    }
  },
  watch: {
    show: {
      handler(newVal) {
        this.innerShow = newVal;
        if (newVal) {
          this.touchIndex = 0;
          this.initDisplayData();
        }
      },
      immediate: true
    },
    innerShow(newVal) {
      if (!newVal) {
        this.$emit('update:show', false);
        this.$emit('close', false);
      }
    },
    // 监听resultDate的变化，更新picker列
    resultDate: {
      handler() {
        if (this.innerShow) {
          this.updatePickerColumns();
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initDisplayData();
  },
  methods: {
    initDisplayData() {
      if (this.lastConfirmedDate.length > 0) {
        this.resultDate = [...this.lastConfirmedDate];
      } else if (this.defaultDate.length > 0) {
        this.resultDate = [...this.defaultDate];
      } else {
        const month = this.padStart(this.currentMonth);
        const day = this.padStart(this.currentDay);
        const nowTime = `${this.currentYear}-${month}-${day}`;
        this.resultDate = [nowTime, nowTime];
      }
      
      // 初始化天数
      const startDate = new Date(this.resultDate[0]);
      this.updateDays(startDate.getFullYear(), startDate.getMonth() + 1);
      this.updatePickerColumns();
    },

    touchSelect(val) {
      this.touchIndex = val;
      // 更新picker列以反映当前选中的日期
      this.updatePickerColumns();
    },

    onPickerChange(picker, values) {
      // 添加安全检查，确保values数组存在且长度正确
      if (!values || values.length < 3) {
        return;
      }

      // 检查每个值是否有效
      const selectedYearText = values[0];
      const selectedMonthText = values[1];
      const selectedDayText = values[2];

      if (!selectedYearText || !selectedMonthText || !selectedDayText) {
        return;
      }

      // 提取数值部分
      const year = parseInt(selectedYearText.replace('年', ''));
      const month = parseInt(selectedMonthText.replace('月', ''));
      const day = parseInt(selectedDayText.replace('日', ''));
      
      // 验证提取的值是否有效
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return;
      }
      
      // 更新天数列表
      this.updateDays(year, month);
      
      // 更新结果日期
      this.resultDate[this.touchIndex] = `${year}-${this.padStart(month)}-${this.padStart(day)}`;
      
      // 重新更新picker列，因为天数可能已经改变
      this.updatePickerColumns();
    },

    updatePickerColumns() {
      // 确保当前选中的日期有效
      if (this.resultDate.length === 0) {
        return;
      }
      
      const currentDate = this.resultDate[this.touchIndex];
      if (!currentDate) {
        return;
      }
      
      const parts = currentDate.split('-');
      if (parts.length !== 3) {
        return;
      }
      
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      
      // 更新天数
      this.updateDays(year, month);
      
      // 更新列配置
      this.pickerColumns = [
        {
          values: this.years.map(year => year + '年'),
          defaultIndex: this.years.indexOf(year)
        },
        {
          values: this.months.map(month => month + '月'),
          defaultIndex: this.months.indexOf(this.padStart(month))
        },
        {
          values: this.days.map(day => day + '日'),
          defaultIndex: this.days.indexOf(this.padStart(parseInt(parts[2])))
        }
      ];
    },

    updateDays(year, month) {
      let days = [];
      if (month === 2) {
        // 二月
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        const maxDay = isLeapYear ? 29 : 28;
        for (let i = 1; i <= maxDay; i++) {
          days.push(this.padStart(i));
        }
      } else if ([4, 6, 9, 11].includes(month)) {
        // 小月
        for (let i = 1; i <= 30; i++) {
          days.push(this.padStart(i));
        }
      } else {
        // 大月
        for (let i = 1; i <= 31; i++) {
          days.push(this.padStart(i));
        }
      }
      this.days = days;
    },

    close() {
      this.innerShow = false;
      this.$emit('update:show', false);
      this.$emit('close', false);
    },

    pickerConfirm() {
      const { resultDate } = this;
      let startTime = new Date(resultDate[0]).getTime();
      let endTime = new Date(resultDate[1]).getTime();

      if (startTime > endTime) {
        Toast({
          message: '开始日期应小于结束日期',
          duration: 2000
        });
        return;
      }

      this.lastConfirmedDate = [...resultDate];
      this.$emit('confirm', resultDate);
      this.close();
    },

    padStart(val) {
      return val.toString().padStart(2, '0');
    }
  }
};
</script>

<style lang="less" scoped>
@theme-color: #11D183;
.date-range-picker {
  display: flex;
  flex-direction: column;
  padding: 0 16px 10px 16px;
  background-color: #fff;

  .operate-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 15px;
    background-color: #fff;
    text-align: center;

    .time-item {
      flex: 1;
      padding: 12px 8px;
      border-radius: 8px;
      transition: background-color 0.2s, color 0.2s;
      cursor: pointer;

      .label {
        font-size: 14px;
        color: #888;
        margin-bottom: 6px;
      }

      .date {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .time-item.active {
      background-color: #f0f9ff;
      .label,
      .date {
        color: @theme-color;
      }
    }

    .divider-text {
      font-size: 16px;
      color: #999;
      padding: 0 12px;
    }
  }
  
  .picker-container {
    flex: 1;
  }
}

// 底部按钮样式
.button-group {
  display: flex;
  padding: 10px 16px 20px 16px;
  background: #fff;

  .btn {
    flex: 1;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin: 0 8px;
    z-index: 10;
    &.cancel-btn {
      background: #f5f5f5;
      color: #666;
      
      &:active {
        background: #e0e0e0;
      }
    }

    &.confirm-btn {
      background: @theme-color;
      color: white;
      
      &:active {
        background: darken(@theme-color, 10%);
      }
    }
  }
}
</style>