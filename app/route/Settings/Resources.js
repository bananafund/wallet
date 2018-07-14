import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,ImageBackground,TouchableOpacity,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/Ionicons'
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
import ViewShot from "react-native-view-shot";
import { Eos } from "react-native-eosjs";
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Resources extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {    
          title: "资源管理",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },        
        };
      };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {
        isMemory: true,
        isCalculation: false,
        isNetwork: false,
        isBuyForOther: false,
        isOwn: true,
        isOthers: false,
        isLease: true,
        isTransfer: false,
        tetletext: '内存概况',
        column_One: '100%',
        column_Two: '100%',
        column_Three: '100%',
        ContrastOne: '0.00/0.00',
        ContrastTwo: '0.00/0.00',
        ContrastThree: '0.00/0.00',
        percentageOne: '占用（0%）',
        percentageTwo: '可用（0%）',
        percentageThree: '全网（0%）',
        total: '0.00',
        used: '0.00',
        used_Percentage: '0',
        currency_surplus: '0.00',
        ram_available:'0',
        show: false,
        Currentprice: '0',
        password: "",
        buyRamAmount: "",
        sellRamBytes: "",
        receiver: "",
        delegateb: "",
        undelegateb: "",
    };
  }

  componentDidMount() {
    EasyLoading.show();
    this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {
        this.getAccountInfo();
    }}); 
    this.props.dispatch({type: 'vote/getGlobalInfo', payload: {}, callback: (data) => {
        this.setState({
            total:data.rows[0].max_ram_size?(data.rows[0].max_ram_size/1024/1024/1024).toFixed(2) : "00.00GB",
            used:data.rows[0].total_ram_bytes_reserved?(data.rows[0].total_ram_bytes_reserved/1024/1024/1024).toFixed(2) : "00.00GB",
            used_Percentage:(((data.rows[0].total_ram_bytes_reserved/1024/1024/1024).toFixed(2)/(data.rows[0].max_ram_size/1024/1024/1024).toFixed(2))*10000/100).toFixed()
        });
    }}); 
    this.props.dispatch({type: 'vote/getqueryRamPrice', payload: {}, callback: (data) => {
        this.setState({
            Currentprice:data.data?data.data:'0.00000',
        });
    }}); 
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
    DeviceEventEmitter.addListener('wallet_info', (data) => {
        this.getBalance();
        });

    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
        this.getBalance();
    });

    DeviceEventEmitter.addListener('eos_balance', (data) => {
        this.setEosBalance(data);
    });
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getAccountInfo(){
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      this.setState({ 
          currency_surplus:data.core_liquid_balance.replace(" EOS", ""),
          ram_available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(2),
         });
          EasyLoading.dismis();
          if(this.state.isMemory){
            this.goPage('isMemory');
          }else if(this.state.isCalculation){
            this.goPage('isCalculation');
          }else if(this.state.isNetwork){
            this.goPage('isNetwork');
          }else{
            this.goPage('isBuyForOther');
          }   
    } });
  } 

  getBalance() { 
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
            this.setEosBalance(data);
        }
      })
    } else {
      this.setState({ balance: '0'})
    }
  }
  
  setEosBalance(data){
    if (data.code == '0') {
        if (data.data == "") {
          this.setState({
            balance: '0',
          })
        } else {
          account: this.props.defaultWallet.name,
          this.setState({ balance: data.data.replace("EOS", ""), })
        }
      } else {
        // EasyToast.show('获取余额失败：' + data.msg);
      }
  }

    goPage(current) {
        if (current == 'isMemory'){
            this.setState({ 
                tetletext: '内存概况',
                column_One: (100 - this.props.Resources.display_data.ram_usage_percent.replace("%", "")) + '%',
                column_Two: (100 - this.props.Resources.display_data.ram_left_percent.replace("%", "")) + '%',
                column_Three: (100 - this.state.used_Percentage) + '%',
                ContrastOne: this.props.Resources.display_data.ram_usage + '/' + this.props.Resources.display_data.ram_bytes,
                ContrastTwo: this.props.Resources.display_data.ram_left + '/' + this.props.Resources.display_data.ram_bytes,
                ContrastThree: this.state.used + 'GB/' + this.state.total + 'GB',
                percentageOne: '占用(' + this.props.Resources.display_data.ram_usage_percent + ')',
                percentageTwo: '可用(' + this.props.Resources.display_data.ram_left_percent + ')',
                percentageThree: '全网(' + this.state.used_Percentage + '%)',
            })
        }else if (current == 'isCalculation'){
            this.setState({ 
                tetletext: '计算概况',
                column_One: (100 - this.props.Resources.display_data.cpu_limit_available_percent.replace("%", "")) + '%',
                column_Two: (100 - this.props.Resources.display_data.self_delegated_bandwidth_cpu_weight_percent.replace("%", "")) + '%',
                column_Three: (this.props.Resources.refund_request?this.props.Resources.display_data.refund_request_cpu_left_second_percent:'100%'),
                ContrastOne: this.props.Resources.display_data.cpu_limit_available + '/' + this.props.Resources.display_data.cpu_limit_max,
                ContrastTwo: (this.props.Resources.self_delegated_bandwidth?this.props.Resources.self_delegated_bandwidth.cpu_weight.replace("EOS", ""):'0.0000') + '/' + this.props.Resources.total_resources.cpu_weight.replace("EOS", ""),
                ContrastThree: (this.props.Resources.refund_request?this.transferTimeZone(this.props.Resources.refund_request.request_time.replace("T", " ")):'00:00:00'),
                percentageOne: '可用(ms)',
                percentageTwo: '抵押(EOS)',
                percentageThree: '赎回中('+ (this.props.Resources.refund_request ? this.props.Resources.refund_request.cpu_amount : '0 EOS') + ')',
            })
        }else if (current == 'isNetwork'){
            this.setState({ 
                tetletext: '网络概况',
                column_One: (100 - this.props.Resources.display_data.net_limit_available_percent.replace("%", "")) + '%',
                column_Two: (100 - this.props.Resources.display_data.self_delegated_bandwidth_net_weight_percent.replace("%", "")) + '%',
                column_Three: (this.props.Resources.refund_request?this.props.Resources.display_data.refund_request_net_left_second_percent:'100%'),
                ContrastOne: this.props.Resources.display_data.net_limit_available + '/' + this.props.Resources.display_data.net_limit_max,
                ContrastTwo: (this.props.Resources.self_delegated_bandwidth?this.props.Resources.self_delegated_bandwidth.net_weight.replace("EOS", ""):'0.0000') + '/' + this.props.Resources.total_resources.net_weight.replace("EOS", ""),
                ContrastThree: (this.props.Resources.refund_request?this.transferTimeZone(this.props.Resources.refund_request.request_time.replace("T", " ")):'00:00:00'),
                percentageOne: '可用(ms)',
                percentageTwo: '抵押(EOS)',
                percentageThree: '赎回中('+ (this.props.Resources.refund_request ? this.props.Resources.refund_request.net_amount : '0 EOS') + ')',
            })
        }else if (current == 'isBuyForOther'){
            this.setState({ 
                tetletext: '内存交易',
                column_One: '0%',
                column_Two: '0%',
                column_Three: '0%',
                ContrastOne: '0.00/0.00',
                ContrastTwo: '0.00/0.00',
                ContrastThree: '0.00/0.00',
                percentageOne: '',
                percentageTwo: '',
                percentageThree: '',
            })
        } 
    }
    // goPage(current) {
    //     if (current == 'isMemory'){
    //         this.setState({ 
    //             tetletext: '内存概况',
    //             column_One: this.props.Resources.display_data.ram_left_percent,
    //             column_Two: this.props.Resources.display_data.ram_usage_percent,
    //             column_Three: (100 - this.state.used_Percentage) + '%',
    //             ContrastOne: this.props.Resources.display_data.ram_usage + '/' + this.props.Resources.display_data.ram_bytes,
    //             ContrastTwo: this.props.Resources.display_data.ram_left + '/' + this.props.Resources.display_data.ram_bytes,
    //             ContrastThree: this.state.used + 'GB/' + this.state.total + 'GB',
    //             percentageOne: '占用(' + this.props.Resources.display_data.ram_usage_percent + ')',
    //             percentageTwo: '可用(' + this.props.Resources.display_data.ram_left_percent + ')',
    //             percentageThree: '全网(' + this.state.used_Percentage + '%)',
    //         })
    //     }else if (current == 'isCalculation'){
    //         this.setState({ 
    //             tetletext: '计算概况',
    //             column_One: (100 - this.props.Resources.display_data.cpu_limit_available_percent.replace("%", "")) + '%',
    //             column_Two: (100 - this.props.Resources.display_data.self_delegated_bandwidth_cpu_weight_percent.replace("%", "")) + '%',
    //             column_Three: this.props.Resources.display_data.refund_request_cpu_left_second_percent,
    //             ContrastOne: this.props.Resources.display_data.cpu_limit_available + '/' + this.props.Resources.display_data.cpu_limit_max,
    //             ContrastTwo:  this.props.Resources.cpu_weight + '/' + this.props.Resources.total_resources.cpu_weight.replace(" EOS", ""),
    //             ContrastThree: this.transferTimeZone(this.props.Resources.refund_request ? this.props.Resources.refund_request.request_time.replace("T", " ") : '0000-00-00 00:00:00'),
    //             percentageOne: '可用(ms)',
    //             percentageTwo: '抵押(EOS)',
    //             percentageThree: '赎回中('+ (this.props.Resources.refund_request ? this.props.Resources.refund_request.cpu_amount : '0.00') + ')',
    //         })
    //     }else if (current == 'isNetwork'){
    //         this.setState({ 
    //             tetletext: '网络概况',
    //             column_One: (100 - this.props.Resources.display_data.net_limit_available_percent.replace("%", "")) + '%',
    //             column_Two: (100 - this.props.Resources.display_data.self_delegated_bandwidth_net_weight_percent.replace("%", "")) + '%',
    //             column_Three: this.props.Resources.display_data.refund_request_net_left_second_percent,
    //             ContrastOne: this.props.Resources.display_data.net_limit_available + '/' + this.props.Resources.display_data.net_limit_max,
    //             ContrastTwo: this.props.Resources.net_weight + '/' + this.props.Resources.total_resources.net_weight.replace("EOS", ""),
    //             ContrastThree: this.transferTimeZone(this.props.Resources.refund_request?this.props.Resources.refund_request.request_time.replace("T", " "):'0000-00-00 00:00:00'),
    //             percentageOne: '可用(ms)',
    //             percentageTwo: '抵押(EOS)',
    //             percentageThree: '赎回中('+ (this.props.Resources.refund_request ? this.props.Resources.refund_request.net_amount : '0.00') + ')',
    //         })
    //     }else if (current == 'isBuyForOther'){
    //         this.setState({ 
    //             tetletext: '内存交易',
    //             column_One: '0%',
    //             column_Two: '0%',
    //             column_Three: '0%',
    //             ContrastOne: '0.00/0.00',
    //             ContrastTwo: '0.00/0.00',
    //             ContrastThree: '0.00/0.00',
    //             percentageOne: ' ',
    //             percentageTwo: ' ',
    //             percentageThree: ' ',
    //         })
    //     } 
    // }

     // 更新"内存，计算，网络，内存交易"按钮的状态  
     _updateBtnState(currentPressed, array) { 
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
        let newState = {...this.state};  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        } 
        this.goPage(currentPressed)
    }  

    // 返回内存，计算，网络，内存交易  
    resourceButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isMemory', 'isCalculation','isNetwork', 'isBuyForOther',];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: '#7787A3'}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    }  

     // 更新"自己,他人,租赁,过户"按钮的状态  
     _updateSelectedState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
        let newState = {...this.state};  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        }  
    }  

    // 返回自己,他人,租赁,过户
    tradeButton(style, selectedSate, stateType, buttonTitle) {    
        let BTN_SELECTED_STATE_ARRAY = ['isOwn', 'isOthers','isLease','isTransfer'];  
        return(  
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center',alignItems: 'center', flex: 1,}} onPress={ () => {this._updateSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
              <Text style={{fontSize: 16,color: UColor.fontColor}}>{buttonTitle}</Text>  
              <View style={{width: 12, height: 12, marginHorizontal: 8, borderRadius: 3, backgroundColor: UColor.fontColor, alignItems: 'center', justifyContent: 'center',}}>
                  {selectedSate ?<View style={{width: 10, height: 10, borderRadius: 10, backgroundColor: UColor.tintColor }}/>:null}
              </View>
          </TouchableOpacity>  
        );  
    }  

   // 显示/隐藏 modal  
   _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
    show: !isShow,
    });
  }

    chkAccount(obj) {
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }
            if(j >= charmap.length){
                //非法字符
                obj = obj.replace(tmp, ""); 
                EasyToast.show('请输入正确的账号');
            }
        }
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('接收账号和自己账号不能相同，请重输');
            obj = "";
        }
        return obj;
    }

    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        var max = 9999999999.9999;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        try {
        value = parseFloat(obj);
        } catch (error) {
        value = 0.0000;
        }
        if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
        }
        return obj;
    }

    //转换时间
    transferTimeZone(date){
        //转换时间
        let timezone = moment(date).add(8,'hours').format('YYYY-MM-DD HH:mm:ss');
        let regEx = new RegExp("\\-","gi");
        let validDateStr=timezone.replace(regEx,"/");
        let milliseconds=Date.parse(validDateStr);
        let sendTime = new Date(milliseconds).getTime();
        //当前时间
        let nowTime = new Date().getTime();
        //72小时
        let ThreeTime = 259200000;
        //差值
        let Dvalue = nowTime - sendTime ;
        let SurplusTime = ThreeTime - Dvalue
        // 时 
        const hours = Math.floor(SurplusTime / (3600 * 1000)); 
        // 分 
        const leave2 = SurplusTime % (3600 * 1000); 
        const minutes = Math.floor(leave2 / (60 * 1000)); 
        // 秒 
        const leave3 = leave2 % (60 * 1000); 
        const seconds = Math.round(leave3 / 1000); 
        let Surplus = hours + ':' + minutes + ':' + seconds
        return Surplus;
    }


    // 购买内存
    buyram = (rowData) => { 
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.buyRamAmount == ""){
            EasyToast.show('请输入购买金额');
            return;
        }
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}></Text>  
            </View>
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyLoading.show();
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.buyRamAmount + " EOS", (r) => {
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("购买成功");
                        }else{
                            this._setModalVisible();
                        }
                    });
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('1密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('2密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    };
    // 出售内存
    sellram = (rowData) => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.sellRamBytes == ""){
            EasyToast.show('请输入出售内存kb数量');
            return;
        }
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}></Text>  
            </View>
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyLoading.show();
                    Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, this.state.sellRamBytes * 1024, (r) => {
                        EasyLoading.dismis();
                        if(r.isOwn){
                            this.getAccountInfo();
                            EasyToast.show("出售成功");
                        }else{
                            this._setModalVisible();
                        }
                    });
                    
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    };

    // 抵押
    delegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.delegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：抵押 {this.state.delegateb} EOS</Text>
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    EasyLoading.show();
                    // 抵押
                    if(this.state.isCalculation){
                        Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.delegateb + " EOS", "0 EOS", (r) =>{
                            EasyLoading.dismis();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("抵押成功");
                            }else{
                                this._setModalVisible();
                            }
                        });
                    }else if(this.state.isNetwork){
                        Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver,  "0 EOS", this.state.delegateb + " EOS", (r) =>{
                            EasyLoading.dismis();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("抵押成功");
                            }else{
                                this._setModalVisible();
                            }
                        });
                    }
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() }); 
    };
    //赎回
    undelegateb = () => { 
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.undelegateb == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go"  
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：赎回 {this.state.undelegateb} EOS</Text>
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    EasyLoading.show();
                    // 解除抵押
                    if(this.state.isCalculation){
                        Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.undelegateb + " EOS", "0 EOS", (r) => {
                            EasyLoading.dismis();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("赎回成功");
                            }else{    
                                this._setModalVisible();
                            }
                        })
                    }else if(this.state.isNetwork){
                        Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, "0 EOS", this.state.undelegateb + " EOS", (r) => {
                            EasyLoading.dismis();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("赎回成功");
                            }else{
                                this._setModalVisible();
                            }
                        })
                    }
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    };

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
        <View style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.tetleout}>
                        <Text style={styles.tetletext}>{this.state.tetletext}</Text>
                        <ImageBackground source={UImage.line_bg} resizeMode="cover" style={styles.linebgout}>
                            <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                <View style={styles.stripbg} height={this.state.column_One}/>
                            </ImageBackground>
                            <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                <View style={styles.stripbg} height={this.state.column_Two}/>
                            </ImageBackground>
                            <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                <View style={styles.stripbg} height={this.state.column_Three}/>
                            </ImageBackground>
                        </ImageBackground>
                        <View style={styles.record}>
                            <View style={styles.recordout}>
                                <Text style={styles.ratiotext}>{this.state.ContrastOne}</Text>
                                <Text style={styles.recordtext}>{this.state.percentageOne}</Text>
                            </View>
                            <View style={styles.recordout}>
                                <Text  style={styles.ratiotext}>{this.state.ContrastTwo}</Text>
                                <Text style={styles.recordtext}>{this.state.percentageTwo}</Text>
                            </View>
                            <View style={styles.recordout}>
                                <Text  style={styles.ratiotext}>{this.state.ContrastThree}</Text>
                                <Text style={styles.recordtext}>{this.state.percentageThree}</Text>
                            </View>
                        </View>
                        </View>
                        <View style={styles.tablayout}>  
                            {this.resourceButton(styles.buttontab, this.state.isMemory, 'isMemory', '内存资源')}  
                            {this.resourceButton(styles.buttontab, this.state.isCalculation, 'isCalculation', '计算资源')}  
                            {this.resourceButton(styles.buttontab, this.state.isNetwork, 'isNetwork', '网络资源')}  
                            {this.resourceButton(styles.buttontab, this.state.isBuyForOther, 'isBuyForOther', '内存交易')}  
                        </View> 
                        {this.state.isBuyForOther?<View style={styles.nothave}><Text style={styles.copytext}>还没有交易哟~</Text></View>:
                        <View style={styles.nhaaout}>
                            {this.state.isMemory?<View style={styles.wterout}>
                            <View style={styles.OwnOthers}>  
                                    {this.tradeButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                    {this.tradeButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                </View></View>:
                                <View style={styles.wterout}>
                                <View style={styles.OwnOthers}>  
                                    {this.tradeButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                    {this.tradeButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                </View>
                                <View style={styles.LeaseTransfer}>  
                                    {this.tradeButton(styles.tabbutton, this.state.isLease, 'isLease', '租赁')}  
                                    {this.tradeButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', '过户')}  
                                </View>
                            </View> }
                            {this.state.isOwn ? null:
                            <View style={styles.inptoutsource}>
                                {this.state.isMemory?<Text style={styles.inptTitle}>注：只限EOS账号，一旦送出可能无法收回！</Text>:<Text style={styles.inptTitle}>设置接收者</Text>}
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._account = ref} value={this.state.receiver} returnKeyType="go"
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                                        placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" 
                                        onChangeText={(receiver) => this.setState({ receiver: this.chkAccount(receiver)})}
                                    />
                                    <Button >
                                        <View style={styles.botnimg}>
                                            <Image source={UImage.scan} style={{width: 26, height: 26, }} />
                                        </View>
                                    </Button> 
                                </View>
                            </View>}  
                            {this.state.isMemory?<View>
                                <View style={styles.inptoutsource}>
                                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                        <Text style={styles.inptTitle}>购买内存（{this.state.currency_surplus}EOS）</Text>
                                        <Text style={{fontSize:12, color: '#7787A3',}}>≈{(this.state.currency_surplus*this.state.Currentprice).toFixed(3)}kb</Text>
                                    </View>
                                    <View style={styles.outsource}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                        placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                                        />
                                        <Button onPress={this.buyram.bind(this)}>
                                            <View style={styles.botn}>
                                                <Text style={styles.botText}>购买</Text>
                                            </View>
                                        </Button> 
                                    </View>
                                </View>
                                {this.state.isOthers ? null:<View style={styles.inptoutsource}>
                                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                        <Text style={styles.inptTitle}>出售内存（{this.state.ram_available}KB）</Text>
                                        <Text style={{fontSize:12, color: '#7787A3',}}>≈{(this.state.ram_available/this.state.Currentprice).toFixed(3)}EOS</Text>
                                    </View>
                                    <View style={styles.outsource}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow}
                                        placeholder="输入出售的数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes)})}
                                        />
                                        <Button onPress={this.sellram.bind(this)}>
                                            <View style={styles.botn}>
                                                <Text style={styles.botText1}>出售</Text>
                                            </View>
                                        </Button> 
                                    </View>
                                </View>}
                            </View>:
                            <View>
                                <View style={styles.inptoutsource}>
                                    <Text style={styles.inptTitle}>抵押（EOS）</Text>
                                    <View style={styles.outsource}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegateb} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                        placeholder="输入抵押数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(delegateb) => this.setState({ delegateb: this.chkPrice(delegateb)})}
                                        />
                                        <Button onPress={this.delegateb.bind()}>
                                            <View style={styles.botn}>
                                                <Text style={styles.botText}>抵押</Text>
                                            </View>
                                        </Button> 
                                    </View>
                                </View>
                                <View style={styles.inptoutsource}>
                                    <Text style={styles.inptTitle}>赎回（EOS）</Text>
                                    <View style={styles.outsource}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.undelegateb} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                        placeholder="输入赎回数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                        onChangeText={(undelegateb) => this.setState({ undelegateb: this.chkPrice(undelegateb)})}   
                                        />
                                        <Button onPress={this.undelegateb.bind()}>
                                            <View style={styles.botn}>
                                                <Text style={styles.botText}>赎回</Text>
                                            </View>
                                        </Button> 
                                    </View>
                                </View>
                            </View>}
                            {this.state.isMemory?
                            <View style={styles.basc}>
                                <Text style={styles.basctext}>提示</Text>
                                <Text style={styles.basctext}>当前内存价格：{this.state.Currentprice}/KB</Text>
                                <Text style={styles.basctext}>内存资源，可以使用EOS买入，也可以出售得EOS</Text>
                            </View>
                            :
                            <View style={styles.basc}>
                                <Text style={styles.basctext}>提示</Text>
                                <Text style={styles.basctext}>获取资源需要抵押EOS </Text>
                                <Text style={styles.basctext}>抵押的EOS可撤销抵押，并于3天后退回</Text>
                            </View>}
                        </View>}
                </TouchableOpacity>
            </ScrollView>  
        </KeyboardAvoidingView> 
    </View>
        )
    }
}
const styles = StyleSheet.create({
    nothave: {
        height: Platform.OS == 'ios' ? 84.5 : 65,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: 20,
        borderRadius: 5,
        margin: 5,
    },
    copytext: {
        fontSize: 16, 
        color: UColor.fontColor
    },
    // 密码输入框
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: ScreenWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    inptpasstext: {
        fontSize: 14,
        color: '#808080',
        lineHeight: 25,
        marginTop: 5,
    },

    inptoutsource1: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'center',
    },
    outsource1: {
        flexDirection: 'row',  
        alignItems: 'center',
    },
    inpt1: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: 15, 
        height: 40, 
        paddingLeft: 10, 
        backgroundColor: UColor.fontColor, 
        borderRadius: 5,
    },
    inptTitlered1: {
        fontSize: 12, 
        color: '#FF6565', 
        lineHeight: 35,
    },
    inptTitle1: {
        fontSize: 14, 
        color: '#7787A3', 
        lineHeight: 35,
    },
    botnimg1: {
        marginLeft: 10, 
        width: 86, 
        height: 38, 
        justifyContent: 'center', 
        alignItems: 'flex-start'
    },
    botn1: {
        marginLeft: 10, 
        width: 86, 
        height: 38,  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText1: {
        fontSize: 17, 
        color: UColor.fontColor,
    },
    basc1: {
        padding: 20,
    },
    basctext1 :{
        fontSize: 12, 
        color: UColor.arrow, 
        lineHeight: 25,
    },

    tabbutton: {  
        alignItems: 'center',   
        justifyContent: 'center', 
    },  
    tablayout: {   
        flexDirection: 'row',  
        padding: 5,
    },  
    buttontab: {  
        margin: 5,
        width: (ScreenWidth-50)/4,
        height: 33,
        borderRadius: 10,
        alignItems: 'center',   
        justifyContent: 'center', 
    },  
    tabText: {  
        fontSize: 12,
    }, 

    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
    },
    nov: {
        alignItems: 'center', 
        flexDirection:'row', 
        marginHorizontal: 6,
        height: 80,  
        backgroundColor:  UColor.mainColor, 
        borderRadius: 5, 
        marginTop: 6,
    },
    imgsize: {
        width: 40, 
        height: 40, 
        marginHorizontal: 20,
    },
    novoutsource: {
        flex: 1, 
        justifyContent: "center", 
        alignItems: 'flex-start', 
        flexDirection:'column',
    },
    headtextSize: {
        fontSize:16, 
        color: UColor.fontColor,  
        paddingBottom: 8,
    },
    textoutsource: {
        flexDirection:'row', 
        alignItems: "center",
    },
    textSizeone: {
        fontSize: 12, 
        color: UColor.arrow,
    },
    textSizetwo: {
        marginLeft: 10,
        fontSize: 12, 
        color: UColor.arrow,
    },
    arrow: {
        width: 40, 
        lineHeight: 80, 
        color: UColor.fontColor, 
        textAlign: 'center'
    },

    nhaaout: {
          backgroundColor: '#4f617d',
      },
      wterout: {
          flexDirection: 'row',
          paddingVertical: 10,
      },
      OwnOthers: {
          flexDirection: 'row',
          paddingHorizontal: 18,
          width: (ScreenWidth - 20) / 2,
      },
      LeaseTransfer: {
          flexDirection: 'row',
          paddingHorizontal: 18,
          width: (ScreenWidth - 20) / 2,
      },

    inptoutsource: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        justifyContent: 'center',
    },
    outsource: {
        flexDirection: 'row',  
        alignItems: 'center',
        borderBottomColor: UColor.secdColor, 
        borderBottomWidth: 0.5,
    },
    inpt: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: 15, 
        height: 45, 
        paddingLeft: 10, 
    },

    inptTitle: {
        fontSize: 14, 
        color: UColor.fontColor, 
        lineHeight: 35,
    },
    botnimg: {
        width: 86, 
        height: 38, 
        paddingHorizontal: 10,
        justifyContent: 'center', 
        alignItems: 'flex-end'
    },
    botn: {
        marginLeft: 10, 
        width: 86, 
        height: 38,  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText: {
        fontSize: 17, 
        color: UColor.fontColor,
    },
    basc: {
        padding: 20,
        backgroundColor: UColor.secdColor,
    },
    basctext :{
        fontSize: 12, 
        color: UColor.arrow, 
        lineHeight: 25,
    },

    tetleout: {
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#4f617d',
    },
    tetletext: {
        fontSize: 15,
        color: '#7787A3',
        paddingVertical: 5
    },

    linebgout: {
        height: (ScreenWidth - 30) * 0.307,
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        flexDirection: 'row',
        zIndex: 1
    },
    stripbgout: {
        width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,
        height: (ScreenWidth - 30) * 0.307 - 5,
        zIndex: 2
    },
    stripbg: {
        backgroundColor: '#43536d'
    },
    ratiotext: {
        fontSize: 12,
        color: UColor.fontColor
    },
    recordtext: {
        fontSize: 12,
        color: '#7787A3'
    },
    record: {
        flexDirection: 'row',
    },
    recordout: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
    },

    animatedout: {
        width: ScreenWidth,
        backgroundColor: UColor.fontColor,
    },
    labelout: {
        fontSize: 12,
        color: UColor.fontColor,
    },
    tabout: {
        width: ScreenWidth / 4,
        padding: 0,
        margin: 0
    },
    indicator: {
        borderRadius: 10,
        backgroundColor: UColor.tintColor,
        width: (ScreenWidth - 40) / 4,
        height: 30,
        marginVertical: 8,
        marginHorizontal: 5,
    },
    tabbarout: {
        height: 46,
        paddingVertical: 8,
        backgroundColor: UColor.secdColor
    },

    //弹框
    pupuo: {
        backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        backgroundColor: UColor.mask,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    // modal上子View的样式  
    subView: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor:  UColor.fontColor,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: UColor.baseline,
    },
    closeText: {
        width: 30,
        height: 30,
        marginBottom: 0,
        color: '#CBCBCB',
        fontSize: 28,
    },
    // 标题  
    titleText: {
        color: '#000000',
        marginBottom: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
    },
    textContent: {
        color: '#999999',
        fontSize: 14,
        textAlign: 'left',
        lineHeight: 25,
    },
    // 按钮  
    buttonView: {
        margin: 10,
        height: 46,
        borderRadius: 6,
        backgroundColor:  UColor.showy,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        color:  UColor.fontColor,
    }
})
export default Resources;