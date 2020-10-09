import { showNotifi } from "app/action/actionNotification.js";
import translate from "app/utils/i18n/Translate.js";
import RestfulUtils from "app/utils/RestfulUtils";
import flow from "lodash.flow";
import React from "react";
import { connect } from "react-redux";
import Select from "react-select";
class GDRutNhapTien extends React.Component {
  constructor(props) {
    super(props);
    this.isComponentMounted = true;
    this.state = {
      listCfmast: [],
      titleModal: "",
      access: "ADD",
      isClear: true,
      loadgrid: false,

      datagroup: {
        p_autoid: 0,
        p_action_type: "",
        p_custodycd: "",
        p_account: "",
        p_balance: "",
        p_type: "",
        p_birthdate: "",
        p_transaction_balance: "",
        p_fullname: "",
        p_cdcontent: "",
        p_en_cdcontent: "",
        p_status: "",
        pv_objname: "THINHBACKACC",
      },
      checkFields: [
        { name: "p_custodycd", id: "drdCustodycd" },
        { name: "p_transaction_balance", id: "txtTransaction_balance" },
        { name: "p_action_type", id: "inpActiontype" },
      ],
    };
  }

  componentWillMount() {
    this.isComponentMounted = true;
    RestfulUtils.post("/banking/getListCfmastRutNopTien", {
      p_language: this.props.lang,
      OBJNAME: "THINHBACKACC",
    }).then((res) => {
      if (this.isComponentMounted == true) {
        this.setState({
          ...this.state,
          listCfmast: res,
        });
      }
    });
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  onChange(type, event) {
    if (event.target) {
      if (
        type == "p_transaction_balance" &&
        isNaN(Number(event.target.value.replace(/,/g, "")))
      ) {
        if (event.target.value == ".") {
          this.state.datagroup.p_transaction_balance = ".";
          this.setState({ datagroup: this.state.datagroup });
        }
        return;
      } else {
        if (type == "p_transaction_balance" && event.target.value == "") {
          this.state.datagroup.p_action_type = "";
        }
        if (
          type == "p_transaction_balance" &&
          parseFloat(event.target.value.replace(/,/g, "")) > parseFloat(this.state.datagroup.p_balance)
        ) {
          event.target.value = this.state.datagroup.p_balance
        }
        this.state.datagroup[type] = event.target.value
          .replace(/,/g, "")
          .replace(/^0+/, "")
          .replace(/(?<=\d*\.\d{2})(\d*)/, "");
      }
    } else {
      this.state.datagroup[type] = event.value;
    }
    this.setState({ datagroup: this.state.datagroup });
  }

  onChangeCus(e) {
    if (e && e.value) {
      this.state.datagroup["p_custodycd"] = e.value;
      this.state.datagroup["p_fullname"] = e.fullname;
      this.state.datagroup["p_birthdate"] = e.birthdate;
      this.state.datagroup["p_cdcontent"] = e.cdcontent;
      this.state.datagroup["p_en_cdcontent"] = e.en_cdcontent;
      this.state.datagroup["p_account"] = e.account;
      this.state.datagroup["p_type"] = e.type;
      this.state.datagroup["p_balance"] = e.balance;
      this.state.datagroup.p_transaction_balance = 0;
      this.state.datagroup.p_action_type = "";
      this.setState(this.state);
    } else {
      this.state.datagroup["p_custodycd"] = "";
      this.state.datagroup["p_fullname"] = "";
      this.state.datagroup["p_birthdate"] = "";
      this.state.datagroup["p_cdcontent"] = "";
      this.state.datagroup["p_en_cdcontent"] = "";
      this.state.datagroup["p_account"] = "";
      this.state.datagroup["p_type"] = "";
      this.state.datagroup["p_balance"] = 0;
      this.state.datagroup.p_transaction_balance = 0;
      this.state.datagroup.p_action_type = "";
      this.setState(this.state);
    }
  }

  async submitGroup() {
    console.log("lang", this.props.lang);
    var mssgerr = "";
    for (let index = 0; index < this.state.checkFields.length; index++) {
      const element = this.state.checkFields[index];
      mssgerr = this.checkValid(element.name, element.id);
      if (mssgerr !== "") break;
    }
    if (mssgerr == "") {
      var api = "/banking/changeBalance";
      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      RestfulUtils.posttrans(api, {
        ...this.state.datagroup,
        p_language: this.props.lang,
        pv_action: this.state.access,
      }).then((res) => {
        if (res.EC == 0) {
          this.resetState();
          datanotify.type = "success";
          datanotify.content = this.props.strings.success;
          dispatch(showNotifi(datanotify));
        } else {
          datanotify.type = "error";
          datanotify.content = res.EM;
          dispatch(showNotifi(datanotify));
        }
      });
    }
  }

  checkValid(name, id) {
    let value = this.state.datagroup[name];
    let mssgerr = "";
    switch (name) {
      case "p_custodycd":
        if (this.state.datagroup["p_custodycd"] == "") {
          mssgerr = this.props.strings.require_custodycd;
        }
        break;
      case "p_action_type":
        if (this.state.datagroup["p_action_type"] == "") {
          mssgerr = this.props.strings.require_action;
        }
      case "p_transaction_balance":
        if (this.state.datagroup["p_transaction_balance"] == "") {
          mssgerr = this.props.strings.require_transaction_balance;
        } else if (this.state.datagroup["p_transaction_balance"] <= 0) {
          mssgerr = this.props.strings.check_number_transaction_balance;
        }
        break;
      default:
        break;
    }
    if (mssgerr !== "") {
      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      datanotify.type = "error";
      datanotify.content = mssgerr;
      dispatch(showNotifi(datanotify));
      window.$(`#${id}`).focus();
    }
    return mssgerr;
  }

  formatNumber = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  resetState = () => {
    this.state.datagroup["p_custodycd"] = "";
    this.state.datagroup["p_fullname"] = "";
    this.state.datagroup["p_birthdate"] = "";
    this.state.datagroup["p_cdcontent"] = "";
    this.state.datagroup["p_en_cdcontent"] = "";
    this.state.datagroup["p_account"] = "";
    this.state.datagroup["p_type"] = "";
    this.state.datagroup["p_balance"] = 0;
    this.state.datagroup.p_transaction_balance = 0;
    this.state.datagroup.p_action_type = "";
    this.setState({ ...this.state });
  };
  render() {
    let { datapage } = this.props;
    const displayy = true;
    return (
      <div
        style={{ borderColor: "rgba(123, 102, 102, 0.43)", padding: "10px" }}
        className="container panel panel-success margintopNewUI"
      >
        <div className="title-content">{this.props.strings.TITLE}</div>
        <div className="panel-body">
          {/*khách hàng  */}
          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.custodycd}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <Select
                name="form-field-name"
                //loadOptions={this.getOptions.bind(this) }
                options={this.state.listCfmast}
                value={this.state.datagroup.p_custodycd}
                placeholder={this.props.strings.custodycd}
                onChange={this.onChangeCus.bind(this)}
                id="drdCustodycd"
                cache={false}
              />
            </div>
          </div>
          {/* Tên khách hàng */}
          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.fullname}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.fullname}
                id="txtFullname"
                value={this.state.datagroup["p_fullname"]}
                onChange={this.onChange.bind(this, "p_fullname")}
              />
            </div>
          </div>

          {/* Ngày sinh */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.birthdate}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.birthdate}
                id="txtBirthdate"
                value={this.state.datagroup["p_birthdate"]}
                onChange={this.onChange.bind(this, "p_birthdate")}
              />
            </div>
          </div>

          {/* Số tài khoản */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.ACCOUNT}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.ACCOUNT}
                id="txtAccount"
                value={this.state.datagroup["p_account"]}
                onChange={this.onChange.bind(this, "p_account")}
              />
            </div>
          </div>

          {/* Loại tài khoản */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.type}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.ACCOUNT}
                id="txtCdcontent"
                value={
                  this.props.lang == "vie"
                    ? this.state.datagroup["p_cdcontent"]
                    : this.state.datagroup["p_en_cdcontent"]
                }
              />
            </div>
          </div>

          {/* Số dư */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.balance}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={30}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.balance}
                id="txtBalance"
                value={this.formatNumber(this.state.datagroup["p_balance"])}
                onChange={this.onChange.bind(this, "p_balance")}
              />
            </div>
          </div>

          {/* Số dư giao dịch */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.TRANSACTION_BAANCE}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={12}
                className="form-control"
                type="text"
                placeholder={this.props.strings.TRANSACTION_BAANCE}
                id="txtTransaction_balance"
                value={this.formatNumber(
                  this.state.datagroup["p_transaction_balance"]
                )}
                onChange={this.onChange.bind(this, "p_transaction_balance")}
              />
            </div>
          </div>

          {/* chọn hình thức */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.action}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <label className="radio-inline">
                <input
                  disabled={
                    this.state.datagroup.p_transaction_balance <= 0 ||
                    this.state.datagroup.p_transaction_balance === "" ||
                    this.state.datagroup.p_transaction_balance === "."
                      ? true
                      : false
                  }
                  type="radio"
                  id="inpActiontype"
                  aria-label="Radio button for following text input"
                  name="action"
                  value="RT"
                  checked={
                    this.state.datagroup["p_action_type"] === "RT"
                      ? true
                      : false
                  }
                  onChange={this.onChange.bind(this, "p_action_type")}
                ></input>
                <b>{this.props.strings.radio_withdrawal}</b>
              </label>
              <label className="radio-inline">
                <input
                  disabled={
                    this.state.datagroup.p_transaction_balance <= 0 ||
                    this.state.datagroup.p_transaction_balance === "" ||
                    this.state.datagroup.p_transaction_balance === "."
                      ? true
                      : false
                  }
                  id="inpActiontype"
                  type="radio"
                  value="NT"
                  aria-label="Radio button for following text input"
                  name="action"
                  checked={
                    this.state.datagroup["p_action_type"] === "NT"
                      ? true
                      : false
                  }
                  onChange={this.onChange.bind(this, "p_action_type")}
                ></input>
                <b>{this.props.strings.radio_payment}</b>
              </label>
            </div>
          </div>

          <div className="col-md-12 row">
            <div className="pull-right">
              <input
                type="button"
                onClick={this.submitGroup.bind(this)}
                className="btn btn-primary"
                style={{ marginRight: 15 }}
                value={this.props.strings.submit}
                id="btnSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const stateToProps = (state) => ({
  veryfiCaptcha: state.veryfiCaptcha,
  notification: state.notification,
  lang: state.language.language,
});

const decorators = flow([connect(stateToProps), translate("GDRutNopTien")]);

module.exports = decorators(GDRutNhapTien);
