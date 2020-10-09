import React, { Component } from "react";
import { Modal } from "react-bootstrap";
// import DropdownFactory from "../../../../../utils/DropdownFactory";
import DropdownBank from "../../../../../utils/DropdownBank";
import Select from "react-select";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import RestfulUtils from "app/utils/RestfulUtils";
import { showNotifi } from "app/action/actionNotification.js";
import { message } from "antd";
class ModalDetailChiNhanh_info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      access: "ADD",
      CUSTID: "",
      datagroup: {
        p_autoid: 0,
        p_branch_code: "",
        p_bankcode: "",
        p_address: "",
        p_bankname: "",
        p_cdcontent: "",
        p_director: "",
        p_encdContent: "",
        p_name: "",
        p_status: "",
        p_population: "",
        pv_language: this.props.lang,
      },
      checkFields: [
        { name: "p_branch_code", id: "txtBranchcode" },
        { name: "p_name", id: "txtName" },
        { name: "p_bankcode", id: "txtBankCode" },
        { name: "p_director", id: "txtDirector" },
        { name: "p_population", id: "txtPopulation" },
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
  //Get list bank

  componentWillReceiveProps(nextProps) {
    let self = this;

    if ((nextProps.access == "EDIT" || nextProps.access == "VIEW") && nextProps.isClear) {
      this.props.change();
      this.setState({
        datagroup: {
          p_autoid: nextProps.DATA.AUTOID,
          p_branch_code: nextProps.DATA.BRANCH_CODE,
          p_bankcode: nextProps.DATA.BANKCODE,
          p_address: nextProps.DATA.ADDRESS,
          p_bankname: nextProps.DATA.BANKNAME,
          p_cdcontent: nextProps.DATA.CDCONTENT,
          p_status: nextProps.DATA.STATUS,
          p_director: nextProps.DATA.DIRECTOR,
          p_encdContent: nextProps.DATA.EN_CDCONTENT,
          p_name: nextProps.DATA.NAME,
          p_population: nextProps.DATA.POPULATION,
          pv_language: this.props.lang,
          p_status: "",
          pv_objname: this.props.OBJNAME,
        },
        access: nextProps.access,
        isDone: true,
      });
    } else if (nextProps.isClear) {
      this.props.change();
      this.setState({
        datagroup: {
          p_autoid: 0,
          p_branch_code: "",
          p_bankcode: "",
          p_address: "",
          p_bankname: "",
          p_cdcontent: "",
          p_director: "",
          p_status: "",
          p_encdContent: "",
          p_name: "",
          p_population: "",
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
  componentDidMount() {
    // io.socket.post('/account/get_detail',{CUSTID:this.props.CUSTID_VIEW,TLID:"0009"}, function (resData, jwRes) {
    //     console.log('detail',resData)
    //     // self.setState({generalInformation:resData});

    // });
    window.$("#txtCustodycd").focus();
  }

  handleChange(type) {
    this.state.collapse[type] = !this.state.collapse[type];
    this.setState({ collapse: this.state.collapse });
  }
  onChange(type, event) {
    if (event.target) {
      console.log(!isNaN(Number(event.target.value)))
      if(type == 'p_population' && isNaN(Number(event.target.value.replace(/,/g, '')))){
        console.log('nhay vao')
        return;
      }else{
        this.state.datagroup[type] = event.target.value.replace(/,/g, '').replace(/^0+/, "").replace(/\./g, '');
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
    if (mssgerr == "") {
      var api = "/banking/processingBranch";
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
      case "p_name":
        if (value == "") {
          mssgerr = this.props.strings.require_branch_name;
        }
      case "p_branch_code":
        if (value == "") {
          mssgerr = this.props.strings.require_branch_code;
        }
        break;
      case "p_population":
        if (value == "") {
          mssgerr = this.props.strings.require_population;
        } else {
          if (value <= 0) {
            mssgerr = this.props.strings.check_number_population;
          }
        }
        break;
      case "p_bankcode":
        if (value == "") {
          mssgerr = this.props.strings.require_bankcode;
        }
        break;
      case "p_director":
        if (value == "") {
          mssgerr = this.props.strings.require_director;
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
      this.setState(this.state);
    } else {
      this.state.generalInformation["p_bankcode"] = "";
      this.setState(this.state);
    }
  }

  getOptionsDirector(input) {
    return RestfulUtils.post("/banking/getListCFMastVip", {
      p_language: this.props.lang,
      pv_objname: "THINHBRANCH",
    }).then((res) => {
      return { options: res.DT.data };
    });
  }

  onChangeDirector(e) {
    if (e && e.value) {
      this.state.datagroup["p_director"] = e.value;
      this.setState(this.state);
    } else {
      this.state.generalInformation["p_director"] = "";
      this.setState(this.state);
    }
  }

    ////////////////

    formatNumber = (num) => {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    ////////

  render() {
    console.log("Hieu========>", this.state.datagroup);
    var cdname = "";
    var displayyIDTYPE = false;
    if (
      (this.state.datagroup["p_custtype"] == "" ||
        this.state.datagroup["p_custtype"] == "CN") &&
      (this.state.datagroup["p_grinvestor"] == "" ||
        this.state.datagroup["p_grinvestor"] == "TN")
    ) {
      cdname = "IDTYPETNCN";
    } else if (
      this.state.datagroup["p_custtype"] == "TC" &&
      this.state.datagroup["p_grinvestor"] == "TN"
    ) {
      cdname = "IDTYPETKSD";
      displayyIDTYPE = true;
    } else if (this.state.datagroup["p_grinvestor"] == "NN") {
      cdname = "IDTYPETKSD";
      displayyIDTYPE = true;
    }
    let displayy = this.state.access == "EDIT" ? true : false;

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
                      <b>{this.props.strings.branchCode}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      maxLength={10}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.branchCode}
                      id="txtBranchcode"
                      value={this.state.datagroup["p_branch_code"]}
                      onChange={this.onChange.bind(this, "p_branch_code")}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.name}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      maxLength={255}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.name}
                      id="txtName"
                      value={this.state.datagroup["p_name"]}
                      onChange={this.onChange.bind(this, "p_name")}
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
                      maxLength={255}
                      className="form-control"
                      type="text"
                      placeholder={this.props.strings.address}
                      id="txtAddress"
                      value={this.state.datagroup["p_address"]}
                      onChange={this.onChange.bind(this, "p_address")}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.bankName}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <Select.Async
                      name="form-field-name"
                      disabled={false}
                      placeholder={this.props.strings.bankName}
                      loadOptions={this.getOptionsBankcode.bind(this)}
                      value={this.state.datagroup.p_bankcode.trim()}
                      onChange={this.onChangeBankcode.bind(this)}
                      id="txtBankCode"
                      cache={false}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.director}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <Select.Async
                      name="form-field-name"
                      disabled={false}
                      placeholder={this.props.strings.director}
                      loadOptions={this.getOptionsDirector.bind(this)}
                      value={this.state.datagroup.p_director.trim()}
                      onChange={this.onChangeDirector.bind(this)}
                      id="txtDirector"
                      cache={false}
                    />
                  </div>
                </div>

                <div className="col-md-12 row">
                  <div className="col-md-3">
                    <h5 className="highlight">
                      <b>{this.props.strings.population}</b>
                    </h5>
                  </div>
                  <div className="col-md-9">
                    <input
                      maxLength={11}
                      className="form-control"
                      type="text"   
                      placeholder={this.props.strings.population}
                      id="txtPopulation"
                      value={ this.formatNumber(this.state.datagroup["p_population"])}
                      onChange={this.onChange.bind(this, "p_population")}
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
  translate("ModalDetailChiNhanh_info"),
]);
module.exports = decorators(ModalDetailChiNhanh_info);
// export default ModalDetail;
