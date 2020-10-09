import { showNotifi } from "app/action/actionNotification.js";
import translate from "app/utils/i18n/Translate.js";
import RestfulUtils from "app/utils/RestfulUtils";
import flow from "lodash.flow";
import React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { message } from "antd";
class GDChuyenTien extends React.Component {
  constructor(props) {
    super(props);
    this.isComponentMounted = true;
    this.state = {
      listCfmast1: [],
      listCfmast2: [],
      titleModal: "",
      access: "ADD",
      isClear: true,
      loadgrid: false,

      CUSTODYCD: { value: "", label: "" },
      datagroup: {
        p_autoid: 0,
        p_action_type: "",
        p_watershed_account: "",
        p_watershed_name: "",
        p_watershed_balance: "",
        p_watershed_bank_name: "",

        p_target_account: "",
        p_target_name: "",
        p_target_bank_name: "",

        p_transaction_balance: 0,
        p_date_of_payment: new Date(),
        p_fees: 0,
        p_content: "",
        pv_objname: "THINHTRANSFER",
      },
      checkFields: [
        { name: "p_watershed_account", id: "drdWatershedAccount" },
        { name: "p_target_account", id: "drdTargetAccount" },
        { name: "p_transaction_balance", id: "txtTransactionBalance" },
        { name: "p_content", id: "txtContent" },
      ],
    };
  }

  componentWillMount() {
    this.isComponentMounted = true;
    RestfulUtils.post("/banking/getListBankAccGDChuyenTien", {
      p_account: "",
      p_language: this.props.lang,
      OBJNAME: "THINHTRANSFER",
    }).then((res) => {
      if (this.isComponentMounted) {
        this.setState({
          ...this.state,
          listCfmast1: res.DT.data,
          listCfmast2: res.DT.data,
        });
      }
    });
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  change() {
    this.setState({ isClear: false });
  }
  load() {
    this.setState({ loadgrid: true });
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
        if (
          type == "p_transaction_balance" &&
          parseFloat(event.target.value.replace(/,/g, "")) >
            parseFloat(this.state.datagroup.p_watershed_balance) -
              parseFloat(
                this.fees(
                  this.state.datagroup.p_target_bank_name,
                  this.state.datagroup.p_watershed_bank_name,
                  this.state.datagroup.p_transaction_balance
                )
              )
        ) {
          event.target.value =
            parseFloat(this.state.datagroup.p_watershed_balance) -
            parseFloat(
              this.fees(
                this.state.datagroup.p_target_bank_name,
                this.state.datagroup.p_watershed_bank_name,
                this.state.datagroup.p_transaction_balance
              )
            );
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
    const {
      p_target_bank_name,
      p_watershed_bank_name,
      p_transaction_balance,
    } = this.state.datagroup;
    this.state.datagroup.p_fees = this.fees(
      p_watershed_bank_name,
      p_target_bank_name,
      p_transaction_balance
    );
    this.setState({ datagroup: this.state.datagroup });
  }

  onChangeCus1(e) {
    if (e && e.value) {
      const {
        p_target_bank_name,
        p_watershed_bank_name,
        p_transaction_balance,
      } = this.state.datagroup;

      this.state.datagroup.p_watershed_account = e.value;
      this.state.datagroup.p_watershed_name = e.fullname;
      this.state.datagroup.p_watershed_bank_name = e.bankname;
      this.state.datagroup.p_watershed_balance = e.balance;
      this.state.datagroup.p_transaction_balance = 0;
      this.state.datagroup.p_fees = 0;

      this.state.datagroup.p_fees = this.fees(
        p_watershed_bank_name,
        p_target_bank_name,
        p_transaction_balance
      );
      this.setState(this.state);
      this.getOptions1(e.value);
    } else {
      this.state.datagroup.p_watershed_account = "";
      this.state.datagroup.p_watershed_name = "";
      this.state.datagroup.p_watershed_bank_name = "";
      this.state.datagroup.p_watershed_balance = 0;
      this.state.datagroup.p_transaction_balance = 0;
      this.state.datagroup.p_fees = 0;
      this.setState(this.state);
      this.getOptions1('');
    }
  }

  onChangeCus2(e) {
    if (e && e.value) {
      const {
        p_target_bank_name,
        p_watershed_bank_name,
        p_transaction_balance,
      } = this.state.datagroup;

      this.state.datagroup.p_target_account = e.value;
      this.state.datagroup.p_target_name = e.fullname;
      this.state.datagroup.p_target_bank_name = e.bankname;
      this.state.datagroup.p_fees = this.fees(
        p_watershed_bank_name,
        p_target_bank_name,
        p_transaction_balance
      );
      this.setState(this.state);
      this.getOptions2(e.value);
    } else {
      this.state.datagroup.p_target_account = "";
      this.state.datagroup.p_target_name = "";
      this.state.datagroup.p_target_bank_name = "";
      this.setState(this.state);
      this.getOptions2('');
    }
  }

  async submitGroup() {
    var mssgerr = "";
    for (let index = 0; index < this.state.checkFields.length; index++) {
      const element = this.state.checkFields[index];
      mssgerr = this.checkValid(element.name, element.id);
      if (mssgerr !== "") break;
    }

    if (
      parseInt(this.state.datagroup.p_watershed_balance) <
      parseInt(this.state.datagroup.p_transaction_balance)
    ) {
      mssgerr = this.props.strings.check_balance;
    }

    if (
      parseInt(this.state.datagroup.p_watershed_balance) <=
      parseInt(this.state.datagroup.p_transaction_balance) +
        parseInt(this.state.datagroup.p_fees)
    ) {
      mssgerr = this.props.strings.check_balance;
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
    }

    if (mssgerr == "") {
      var api = "/banking/sendBalance";
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

  resetState = () => {
    this.state.datagroup.p_watershed_account = "";
    this.state.datagroup.p_watershed_name = "";
    this.state.datagroup.p_watershed_bank_name = "";
    this.state.datagroup.p_watershed_balance = 0;
    this.state.datagroup.p_target_account = "";
    this.state.datagroup.p_target_name = "";
    this.state.datagroup.p_target_bank_name = "";
    this.state.datagroup.p_content = "";
    this.state.datagroup.p_transaction_balance = 0;
    this.state.datagroup.p_fees = 0;

    this.setState({ ...this.state });
  };

  checkValid(name, id) {
    let value = this.state.datagroup[name];
    let mssgerr = "";
    switch (name) {
      case "p_watershed_account":
        if (value.trim() == "") {
          mssgerr = this.props.strings.require_watershed_account;
        }
        break;
      case "p_target_account":
        if (value.trim() == "") {
          mssgerr = this.props.strings.require_target_account;
        }
        break;
      case "p_transaction_balance":
        if (value == "") {
          mssgerr = this.props.strings.require_transaction_balance;
        } else {
          if (value <= 0) {
            mssgerr = this.props.strings.check_number_transaction_balance;
          }
        }
        break;
      case "p_content":
        if (value.trim() == "") {
          mssgerr = this.props.strings.require_content;
        } else {
          if (value.trim().length < 5) {
            mssgerr = this.props.strings.require_content_size;
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

  fees = (bankCode1, bankCode2, transactionBalance) => {
    let feesNumber = 0;
    if (transactionBalance == "") {
      feesNumber = 0;
    } else {
      if (bankCode1 != bankCode2) {
        feesNumber = Math.ceil(transactionBalance / 100);
      }
    }

    return feesNumber;
  };

  formatNumber = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  getOptions1 = (p_account) => {
    //lay ds careby
    // this.isComponentMounted = true;
    RestfulUtils.post("/banking/getListBankAccGDChuyenTien", {
      p_account,
      p_language: this.props.lang,
      OBJNAME: "THINHTRANSFER",
    }).then((res) => {
      if (this.isComponentMounted) {
        this.setState({
          listCfmast2: res.DT.data,
        });
      }
    });
  };
  getOptions2 = (p_account) => {
    //lay ds careby
    // this.isComponentMounted = true;
    RestfulUtils.post("/banking/getListBankAccGDChuyenTien", {
      p_account,
      p_language: this.props.lang,
      OBJNAME: "THINHTRANSFER",
    }).then((res) => {
      if (this.isComponentMounted) {
        this.setState({
          listCfmast1: res.DT.data,
        });
      }
    });
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
          <div
            className="col-md-12"
            style={{ borderBottom: "1px solid #cccccc", marginBottom: "16px" }}
          >
            <h5>
              <b>{this.props.strings.TITLE1}</b>
            </h5>
          </div>

          {/* số tk người chuyển  */}
          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.CHOOSE_ACCOUNT}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <Select
                name="form-field-name"
                //loadOptions={this.getOptions1.bind(this)}
                options={this.state.listCfmast1}
                value={this.state.datagroup.p_watershed_account}
                placeholder={this.props.strings.CHOOSE_ACCOUNT}
                onChange={this.onChangeCus1.bind(this)}
                id="drdWatershedAccount"
                cache={false}
              />
            </div>
          </div>

          {/* Tên người chuyển */}
          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.watershed_name}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.watershed_name}
                id="txtWatershedName"
                value={this.state.datagroup["p_watershed_name"]}
                onChange={this.onChange.bind(this, "p_watershed_name")}
              />
            </div>
          </div>

          {/* Tên ngân hàng của người chuyển */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.bank_name}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.bank_name}
                id="txtWatershedBalance"
                value={this.state.datagroup["p_watershed_bank_name"]}
                onChange={this.onChange.bind(this, "p_watershed_bank_name")}
              />
            </div>
          </div>

          {/* số tiền hiện tại của người chuyển */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.watershed_balance}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.watershed_balance}
                id="txtWatershedBalance"
                value={this.formatNumber(
                  this.state.datagroup["p_watershed_balance"]
                )}
                onChange={this.onChange.bind(this, "p_watershed_balance")}
              />
            </div>
          </div>

          <div
            className="col-md-12"
            style={{ borderBottom: "1px solid #cccccc", marginBottom: "16px" }}
          >
            <h5>
              <b>{this.props.strings.TITLE2}</b>
            </h5>
          </div>

          {/* số tài khoản nhận  */}
          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.target_account}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <Select
                name="form-field-name"
                //  loadOptions={this.getOptions2.bind(this)}
                options={this.state.listCfmast2}
                value={this.state.datagroup.p_target_account}
                placeholder={this.props.strings.target_account}
                onChange={this.onChangeCus2.bind(this)}
                id="drdTargetAccount"
                cache={false}
              />
            </div>
          </div>

          {/* Tên người hưởng thụ */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.target_name}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.target_name}
                id="txtTargetAccount"
                value={this.state.datagroup["p_target_name"]}
                onChange={this.onChange.bind(this, "p_target_name")}
              />
            </div>
          </div>

          {/* Tên ngân hàng người hưởng thụ */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.bank_name}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={500}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.bank_name}
                id="txtTargetBankName"
                value={this.state.datagroup["p_target_bank_name"]}
                onChange={this.onChange.bind(this, "p_target_bank_name")}
              />
            </div>
          </div>

          <div
            className="col-md-12"
            style={{ borderBottom: "1px solid #cccccc", marginBottom: "16px" }}
          >
            <h5>
              <b>{this.props.strings.TITLE3}</b>
            </h5>
          </div>

          {/* Số dư giao dịch */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.transaction_balance}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={12}
                className="form-control"
                type="text"
                placeholder={this.props.strings.transaction_balance}
                id="txtTransactionBalance"
                value={this.formatNumber(
                  this.state.datagroup["p_transaction_balance"]
                )}
                onChange={this.onChange.bind(this, "p_transaction_balance")}
              />
            </div>
          </div>

          {/* Phí */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.fees}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={12}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.fees}
                id="txtFees"
                value={this.formatNumber(this.state.datagroup["p_fees"])}
                onChange={this.onChange.bind(this, "p_fees")}
              />
            </div>
          </div>

          {/* ngày */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="">
                <b>{this.props.strings.date_of_payment}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <input
                maxLength={100}
                disabled={displayy}
                className="form-control"
                type="text"
                placeholder={this.props.strings.date_of_payment}
                value={this.state.datagroup["p_date_of_payment"]}
                onChange={this.onChange.bind(this, "p_date_of_payment")}
              />
            </div>
          </div>

          {/* Nội dung */}

          <div className="col-md-12 row">
            <div className="col-md-3">
              <h5 className="highlight">
                <b>{this.props.strings.content}</b>
              </h5>
            </div>
            <div className="col-md-9">
              <textarea
                maxLength={220}
                rows="4"
                className="form-control"
                placeholder={this.props.strings.content}
                id="txtContent"
                value={this.state.datagroup["p_content"]}
                onChange={this.onChange.bind(this, "p_content")}
              />
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

const decorators = flow([connect(stateToProps), translate("GDChuyenTien")]);

module.exports = decorators(GDChuyenTien);
