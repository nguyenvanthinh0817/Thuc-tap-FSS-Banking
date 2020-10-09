import React, { Component } from "react";
import { Modal } from "react-bootstrap";
// import DropdownFactory from "../../../../../utils/DropdownFactory";

import DropdownCfMast from "../../../../../utils/DropdownCfMast";
import Select from "react-select";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import RestfulUtils from "app/utils/RestfulUtils";
import { showNotifi } from "app/action/actionNotification.js";
class ModalDetailBankAcc_info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      access: "ADD",
     
      datagroup: {
        p_autoid: 0,
        p_custodycd: "",
        p_account: "",
        p_balance: "",
        p_type: "",
        p_address: "",
        p_birthdate: "",
        p_cdcontent: "",
        p_encdContent: "",
        p_name: "",
        p_bankcode: "",
        p_status: "",
        pv_language: this.props.lang,
      },
      checkFields: [
        { name: "p_custodycd", id: "drdCustodycd" },
        { name: "p_account", id: "txtAccount" },
        { name: "p_bankcode", id: "drdBankCode" },
        { name: "p_type", id: "rdoType" },
        { name: "p_balance", id: "txtBalance" },
      ],
      isDone: true,
    };
  }

  close() {
    this.props.closeModalDetail();
  }
  /**
   * Trường hợp update thì hiển thị tất cả thông tin lên cho sửa
   * Trường hơp view thì ẩn các nút sửa không cho duyệt
   * Trường hợp add thì ẩn thông tin chỉ hiện thông tin chung cho người dùng -> Thực hiện -> Mở các thông tin tiếp theo cho người dùng khai
   * @param {*access} nextProps
   */
  componentWillReceiveProps(nextProps) {
    console.log("Lại vào đây", this);
    if ((nextProps.access == "EDIT" || nextProps.access == "VIEW") && nextProps.isClear) {
      this.props.change();
        this.setState({
          datagroup: {
            p_autoid: nextProps.DATA.AUTOID,
            p_custodycd: nextProps.DATA.CUSTODYCD,
            p_account: nextProps.DATA.ACCOUNT,
            p_balance: nextProps.DATA.BALANCE,
            p_type: nextProps.DATA.TYPE,
            p_address: nextProps.DATA.ADDRESS,
            p_name: nextProps.DATA.FULLNAME,
            p_bankcode: nextProps.DATA.BANKCODE,
            p_birthdate: nextProps.DATA.BIRTHDATE,
            pv_language: this.props.lang,
            pv_objname: this.props.OBJNAME,
          },
          access: nextProps.access,
          isDone: true,
        });
      
    } else if (nextProps.isClear) {
      console.log("vào set state add");
      this.props.change();
      this.setState({
        datagroup: {
          p_autoid: 0,
          p_custodycd: "",
          p_account: "",
          p_balance: "0",
          p_type: "",
          p_bankcode: "",
          p_address: "",
          p_name: "",
          pv_language: this.props.lang,
          pv_objname: this.props.OBJNAME,
        },
        new_create: true,
        access: nextProps.access,
        isDone: false,
        //idtype: "IDTYPE",
      });
    }
  }
  // if (type == "p_balance" && isNaN(Number(event.target.value))) {
  //   return;
  // }
  handleChange(type) {
    this.state.collapse[type] = !this.state.collapse[type];
    this.setState({ collapse: this.state.collapse });
  }
  onChange(type, event) {
    if (event.target) {
      this.state.datagroup[type] = event.target.value;
      if (type == "p_type") {
        this.state.datagroup["p_balance"] = "0";
      } else if (
        type == "p_balance" &&
        isNaN(Number(event.target.value.replace(/,/g, "")))
      ) {
        if (event.target.value == ".") {
          this.state.datagroup.p_balance = ".";
          this.setState({ datagroup: this.state.datagroup });
        }
        return;
      } else if (type == "p_account" && isNaN(Number(event.target.value))) {
        return;
      } else if (type == "p_account") {
        this.state.datagroup[type] = event.target.value
          .replace(/,/g, "")
          .replace(/^0+/, "")
          .replace(/\./g, "");
      } else {
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

  onSetDefaultValue = (type, value) => {
    if (!this.state.datagroup[type]) this.state.datagroup[type] = value;
  };

  async submitGroup() {
    var mssgerr = "";
    for (let index = 0; index < this.state.checkFields.length; index++) {
      const element = this.state.checkFields[index];
      mssgerr = this.checkValid(element.name, element.id);
      if (mssgerr !== "") break;
    }

    console.log("van chay xuong day");
    if (mssgerr == "") {
      var api = "/banking/processingBankAcc";
      var { dispatch } = this.props;
      var datanotify = {
        type: "",
        header: "",
        content: "",
      };
      RestfulUtils.posttrans(api, {
        ...this.state.datagroup,
        pv_action: this.state.access,
      }).then((res) => {
        if (res.EC == 0) {
          datanotify.type = "success";
          datanotify.content = this.props.strings.success;
          dispatch(showNotifi(datanotify));
          this.props.load();
          this.props.closeModalDetail();
        } else {
          datanotify.type = "error";
          datanotify.content = res.DT.p_err_param;
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
        if (value == "") {
          mssgerr = this.props.strings.require_custodycd;
        }
        break;
      case "p_account":
        if (value == "") {
          mssgerr = this.props.strings.require_account;
        }
        break;
      case "p_bankcode":
        if (value == "") {
          mssgerr = this.props.strings.require_bankcode;
        }
        break;
      case "p_type":
        if (value == "") {
          mssgerr = this.props.strings.require_type;
        }
        break;
      case "p_balance":
        if (value == "") {
          mssgerr = this.props.strings.require_balance;
        } else {
          if (value < 0) {
            mssgerr = this.props.strings.check_number_balance;
          }
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
  getOptions(input) {
    return { options: this.props.listCfmast };
  }
  onChangeCus(e) {
    if (e && e.value) {
      this.state.datagroup.p_custodycd = e.value;
      this.state.datagroup.p_name = e.fullname;
      this.state.datagroup.p_birthdate = e.birthdate;
      this.state.datagroup.p_address = e.address;
    } else {
      this.state.datagroup["p_custodycd"] = "";
      this.state.datagroup["p_name"] = "";
      this.state.datagroup["p_birthdate"] = "";
      this.state.datagroup["p_address"] = "";
    }
    this.setState({ ...this.state });
  }
  /////////////////

  getOptionsBankcode(input) {
    //lay ds careby
    return RestfulUtils.post("/common/getbankcode", {
      language: this.props.lang,
    }).then((res) => {
      return { options: res };
    });
  }
  onChangeBankcode(e) {
    if (e && e.value) {
      this.state.datagroup["p_bankcode"] = e.value;
      // this.state.generalInformation["BANKACNAME"] = e.label;
      this.setState(this.state);
    } else {
      this.state.datagroup["p_bankcode"] = "";
      // this.state.generalInformation["BANKACNAME"] = "";
      this.setState(this.state);
    }
  }

  formatNumber = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };
  render() {
    var cdname = "";
    let displayy = this.state.access == "EDIT" ? true : false;
    if (this.state.access == "ADD") {
      displayy = true;
    }
    return (
      <Modal show={this.props.showModalDetail}>
        <Modal.Header>
          <Modal.Title>
            <div className="title-content col-md-6">
              {this.props.title}{" "}
              <button
                type="button"
                className="close"
                onClick={this.close.bind(this)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: "auto", height: "100%" }}>
          <div className="panel-body ">
            <div className="add-info-account">
              <div
                className={
                  this.state.access == "VIEW"
                    ? "col-md-12 disable"
                    : "col-md-12 "
                }
                style={{ paddingTop: "11px" }}
              >
                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.custodycd}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <Select
                      name="form-field-name"
                      disabled={this.state.access == "EDIT" ? true : false}
                      //loadOptions={this.getOptions.bind(this) }
                      options={this.props.listCfmast}
                      value={this.state.datagroup.p_custodycd}
                      placeholder={this.props.strings.custodycd}
                      onChange={this.onChangeCus.bind(this)}
                      id="drdCustodycd"
                      cache={false}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
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
                      defaultValue={this.state.datagroup["p_name"]}
                      onChange={this.onChange.bind(this, "p_name")}
                    />
                  </div>
                </div>

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
                      defaultValue={this.state.datagroup["p_birthdate"]}
                      onChange={this.onChange.bind(this, "p_birthdate")}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="">
                      <b>{this.props.strings.address}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      maxLength={500}
                      disabled={displayy}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.address}
                      id="txtAddress"
                      defaultValue={this.state.datagroup["p_address"]}
                      onChange={this.onChange.bind(this, "p_address")}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.ACCOUNT}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      maxLength={20}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.ACCOUNT}
                      id="txtAccount"
                      value={this.state.datagroup["p_account"]}
                      onChange={this.onChange.bind(this, "p_account")}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.bankname}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <Select.Async
                      name="form-field-name"
                      disabled={false}
                      placeholder={this.props.strings.bankname}
                      loadOptions={this.getOptionsBankcode.bind(this)}
                      value={this.state.datagroup.p_bankcode}
                      onChange={this.onChangeBankcode.bind(this)}
                      id="drdBankCode"
                      cache={false}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.type}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <label className="radio-inline">
                      <input
                        type="radio"
                        id="rdoType"
                        name="type"
                        value="TK"
                        checked={
                          this.state.datagroup["p_type"] === "TK" ? true : false
                        }
                        onChange={this.onChange.bind(this, "p_type")}
                      ></input>
                      <span>{this.props.strings.radio_saving}</span>
                    </label>
                    <label className="radio-inline">
                      <input
                        id="rdoType"
                        className="ml-2"
                        type="radio"
                        value="TT"
                        name="type"
                        checked={
                          this.state.datagroup["p_type"] === "TT" ? true : false
                        }
                        onChange={this.onChange.bind(this, "p_type")}
                      ></input>
                      <span>{this.props.strings.radio_pay}</span>
                    </label>
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.balance}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      // disabled={this.state.access == "ADD" ? false : true}
                      maxLength={15}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.balance}
                      id="txtBalance"
                      value={this.formatNumber(
                        this.state.datagroup["p_balance"]
                      )}
                      onChange={this.onChange.bind(this, "p_balance")}
                    />
                  </div>
                </div>

                {/* <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5>
                      <b>{this.props.strings.status}</b>
                    </h5>
                  </div>
                  <div className="col-md-5">
                    <DropdownFactory
                      CDVAL={this.state.datagroup["p_status"]}
                      onSetDefaultValue={this.onSetDefaultValue}
                      onChange={this.onChange.bind(this)}
                      value="p_status"
                      CDTYPE="CF"
                      CDNAME="STATUS"
                      ID="drdSTATUS"
                    />
                  </div>
                </div> */}

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
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
const stateToProps = (state) => ({
  lang: state.language.language,
});
const decorators = flow([
  connect(stateToProps),
  translate("ModalDetailBankAcc_info"),
]);
module.exports = decorators(ModalDetailBankAcc_info);
// export default ModalDetail;
