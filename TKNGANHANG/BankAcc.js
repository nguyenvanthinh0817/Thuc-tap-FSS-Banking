import React from "react";
import { connect } from "react-redux";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import TableBankAcc from "./components/TableBankAcc";
import ModalDetailBankAcc_info from "./components/ModalDetailBankAcc_info";
import RestfulUtils from "app/utils/RestfulUtils";
class BankAcc extends React.Component {
  constructor(props) {
    super(props);
    this.isComponentMounted =  true;
    this.state = {
      listCfmast: [],
      showModalDetail: false,
      titleModal: "",
      access: "ADD",
      isClear: true,
      loadgrid: false,
    };
  }

  closeModalDetail() {
    this.setState({ showModalDetail: false, isClear: true, loadgrid: false , editReset: true,});
  }
  showModalDetail(access, DATAUPDATE) {
    let titleModal = "";
    let DATA = "";

    switch (access) {
      case "ADD":
        titleModal = this.props.strings.modaladd;
        break;
      case "EDIT":
        titleModal = this.props.strings.modaledit;
        break;
      case "VIEW":
        titleModal = this.props.strings.modalview;
        break;
    }
    if (DATAUPDATE != undefined) {
      DATA = DATAUPDATE;
    }

    this.setState({
      showModalDetail: true,
      titleModal: titleModal,
      DATA: DATA,
      access: access,
      isClear: true,
      loadgrid: false,
    });
  }
  change() {
    this.setState({ isClear: false });
  }
  load() {
    this.setState({ loadgrid: true });
  }
  componentDidMount() {
    this.isComponentMounted = true;
    RestfulUtils.post("/banking/getListCfmast", {
      p_language: this.props.lang,
      OBJNAME: 'THINHBACKACC',
    }).then((res) => {
      if(this.isComponentMounted == true){
        this.setState({
          ...this.state,
          listCfmast: res,
        });
      }
      else{
        return;
      }
    });
  }

  componentWillUnmount(){
    this.isComponentMounted = false;
  }
  render() {
    let { datapage } = this.props;
    return (
      <div
        style={{ borderColor: "rgba(123, 102, 102, 0.43)", padding: "10px" }}
        className="container panel panel-success margintopNewUI"
      >
        <div className="title-content">{this.props.strings.TITLE}</div>
        <div className="panel-body">
          <TableBankAcc
            datapage={datapage}
            showModalDetail={this.showModalDetail.bind(this)}
            loadgrid={this.state.loadgrid}
            OBJNAME={datapage ? datapage.OBJNAME : ""}
          />
        </div>
        <ModalDetailBankAcc_info
          load={this.load.bind(this)}
          isClear={this.state.isClear}
          change={this.change.bind(this)}
          access={this.state.access}
          DATA={this.state.DATA}
          title={this.state.titleModal}
          showModalDetail={this.state.showModalDetail}
          closeModalDetail={this.closeModalDetail.bind(this)}
          OBJNAME={datapage ? datapage.OBJNAME : ""}
          listCfmast= {this.state.listCfmast}
        />
      </div>
    );
  }
}
const stateToProps = (state) => ({
  veryfiCaptcha: state.veryfiCaptcha,
  notification: state.notification,
  lang: state.language.language,
});

const decorators = flow([connect(stateToProps), translate("BankAcc")]);

module.exports = decorators(BankAcc);
