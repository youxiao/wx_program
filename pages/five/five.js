import {Board} from "../../renju/board.js"
import {RenjuController} from "../../renju/controller.js"

const NORMAL_MODE = 0; // 顺序落子
const FREE_MODE = 1; // 自由摆局
const NOTE_MODE = 2; // 标注模式

const SHOW_NUM = 0; // 显示全部数字
const SHOW_LAST_5 = 1; // 显示最后5步
const SHOW_NONE_NUM = 2; // 不显示数字

var setting_cache;
var selected_note;
var custom_note;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: NORMAL_MODE,
    show_num: SHOW_NUM,
    mode_text:"打谱模式",
    color: 1, // 0-white, 1-black
    showSettings: false,
    showNoteDlg: false,
    radio_modes: [
      { name: NORMAL_MODE, value: '顺序落子', checked: 'true' },
      { name: FREE_MODE, value: '自由摆局'},
      { name: NOTE_MODE, value: '标注模式' },
    ],
    radio_show_num: [
      { name: SHOW_NUM, value: '显示全部数字', checked: 'true' },
      { name: SHOW_LAST_5, value: '显示最后5步'},
      { name: SHOW_NONE_NUM, value: '不显示数字' },
    ],
    radio_note: [
      { name: "A", value: 'A' },
      { name: "B", value: 'B' },
      { name: "C", value: 'C' },
      { name: "胜", value: '胜' },
      { name: "败", value: '败' },
      { name: "●", value: '●' },
      { name: "△", value: '△' },
      { name: "◯", value: '◯' },
      { name: "✕", value: '✕' },
      { name: "无标注", value: 'none' },
    ],
    show_background: true,  // 显示背景图
    show_coordinate: true,  // 显示坐标
    selected_point: false,  // 是否已经有选中点

    showPreview: false, 
    tmp_picture_path: "",

  },

  b: Board(),
  controller: RenjuController(),

  onLoad: function (options) {
    this.b.init("board");
    this.controller.init(this.b);
  },
  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {},

  onBoardClick: function(e) {
    console.log(e);
    var pt = this.b.pointToXY(e.detail.x-e.target.offsetLeft, e.detail.y-e.target.offsetTop);
    console.log(pt);
    //this.b.addStone(pt.x, pt.y, 0, 'A');
    this.b.selectPoint(pt.x, pt.y);
  },

  onMoveUpClick: function (e) {
    this.b.moveUp();
  },
  onMoveRightClick: function (e) {
    this.b.moveRight();
  },
  onMoveLeftClick: function (e) {
    this.b.moveLeft();
  },
  onMoveDownClick: function (e) {
    this.b.moveDown();
  },

  onGoBeginClick: function() {
    this.controller.goBegin();
  },
  onGoPrevClick: function () {
    this.controller.goPrev();
  },
  onGoNextClick: function () {
    this.controller.goNext();
  },
  onGoEndClick: function () {
    this.controller.goEnd();
  },

  onConfirm: function() {

    if (this.data.mode == NOTE_MODE) {
      this.setData({ showNoteDlg: true});
      return;
    }


    var pt = this.b.getSelectedPoint();
    //this.b.cancelSelect();
    var stone = this.controller.getStone(pt.x, pt.y);
    if (stone) {

    } else {
      this.controller.addStone(pt.x, pt.y, this.data.color);
      if (this.data.color == 1) this.data.color = 0;
      else this.data.color = 1;
    }
  
  },

  onAddBlackStone: function() {
    var pt = this.b.getSelectedPoint();
    //this.b.cancelSelect();
    var stone = this.controller.getStone(pt.x, pt.y);
    if (stone) {

    } else {
      this.controller.addStone(pt.x, pt.y, 1);
    }
  },

  onAddWhiteStone: function() {
    var pt = this.b.getSelectedPoint();
    //this.b.cancelSelect();
    var stone = this.controller.getStone(pt.x, pt.y);
    if (stone) {

    } else {
      this.controller.addStone(pt.x, pt.y, 0);
    }
  },

  onSelectedNoteChanged: function(e) {
    selected_note = e.detail.value;
  },
  onNoteInput: function(e) {
    custom_note = e.detail.value;
  },
  onNoteConfirm: function() {
    var pt = this.b.getSelectedPoint();
    if (selected_note == 'none') {
      this.controller.removeText(pt.x, pt.y);
    } else if (selected_note == 'custom') {
      this.controller.addText(pt.x, pt.y, custom_note);
    } else {
      this.controller.addText(pt.x, pt.y, selected_note);
    }

    this.setData({ showNoteDlg: false });
  },
  onNoteCancel: function() {
    this.setData({ showNoteDlg: false });
  },

  onGenerateImage: function() {
    this.b.generateImage({
      size:800,
      tmp_canvas_id:'hidden-board',
      callback:(res) => {
        console.log('generate img success', res);
        if (res.tempFilePath) {
          this.setData({
            "showPreview":true, 
            "tmp_picture_path":res.tempFilePath
          });
        }
      }
    })
  },
  onSavePreview: function() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.tmp_picture_path,
      success(res) {
        console.log(res);
      }
    });
  },
  onCancelPreview: function() {
    this.setData({
      "showPreview": false,
      "tmp_picture_path": ""
    });
  },

  onShowSettings: function() {
    setting_cache = {
      show_bg: this.data.show_background,
      show_coordinate: this.data.show_coordinate,
      show_num: this.data.show_num,
      mode: this.data.mode
    };
    this.setData({"showSettings":true});
  },
  onSettingsConfirm: function() {
    if (this.data.show_num != setting_cache.show_num) {
      this.controller.setShowNum(setting_cache.show_num);
    }

    if (this.data.show_coordinte != setting_cache.show_coordinate) {
      this.b.setShowCoordinate(setting_cache.show_coordinate);
    }

    this.setData({
      showSettings:false,
      mode:setting_cache.mode,
      mode_text: this.data.radio_modes[setting_cache.mode].value,
      show_num: setting_cache.show_num,
      show_background: setting_cache.show_bg, 
      show_coordinate: setting_cache.show_coordinate,

      'radio_modes[0].checked': setting_cache.mode == 0,
      'radio_modes[1].checked': setting_cache.mode == 1,
      'radio_modes[2].checked': setting_cache.mode == 2,

      'radio_show_num[0].checked': setting_cache.show_num == 0,
      'radio_show_num[1].checked': setting_cache.show_num == 1,
      'radio_show_num[2].checked': setting_cache.show_num == 2,
    });
  },
  onSettingsCancel: function() {
    this.setData({ "showSettings": false });
  },

  onShowBgChanged: function(e) {
    setting_cache.show_bg = e.detail.value;
  },
  onShowCoChanged: function (e) {
    setting_cache.show_coordinate = e.detail.value;
  },
  onModeChanged: function (e) {
    setting_cache.mode = e.detail.value;
  },
  onShowNumChanged: function (e) {
    setting_cache.show_num = parseInt(e.detail.value);
  },

})