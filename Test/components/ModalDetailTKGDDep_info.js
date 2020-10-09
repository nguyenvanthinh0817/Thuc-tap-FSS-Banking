import React, { Component } from 'react';
import { Modal } from 'react-bootstrap'
import DropdownFactory from '../../../../../utils/DropdownFactory';
import flow from 'lodash.flow';
import translate from 'app/utils/i18n/Translate.js';
import { connect } from 'react-redux'
import RestfulUtils from 'app/utils/RestfulUtils';
import { showNotifi } from 'app/action/actionNotification.js';
class ModalDetailTKGDDep_info extends Component {
    constructor(props) {
        super(props);
        this.state = {

            access: 'add',
            CUSTID: '',

            datagroup: {
                p_custodycd: '',
                p_idtype: '',
                p_idcode: '',
                p_fullname: '',
                p_status: '',
                p_pstatus: '',
                p_txdate: '',
                p_lastchange: '',
                pv_language: this.props.lang,

            },
            checkFields: [
                { name: "p_custodycd", id: "txtCustodycd" },
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

        let self = this;


        if (nextProps.access == "update" || nextProps.access == "view") {
            this.setState({

                datagroup: {

                    p_custodycd: nextProps.DATA.CUSTODYCD,
                    p_idtype: nextProps.DATA.IDTYPE,
                    p_idcode: nextProps.DATA.IDCODE,
                    p_fullname: nextProps.DATA.FULLNAME,
                    pv_language: this.props.lang,
                    p_status: '',
                    p_txdate: nextProps.DATA.TXDATE,
                    p_grinvestor: nextProps.DATA.GRINVESTOR,
                    p_custtype: nextProps.DATA.CUSTTYPE,
                    pv_objname: this.props.OBJNAME,


                },
                access: nextProps.access,
                isDone: true

            })
        }
        else
            if (nextProps.isClear) {
                this.props.change()
                this.setState({

                    datagroup: {
                        p_custodycd: '',
                        p_idtype: '',
                        p_idcode: '',
                        p_fullname: '',
                        p_status: '',
                        p_txdate: '',
                        p_grinvestor: '',
                        p_custtype: '',
                        pv_language: this.props.lang,
                        p_txdate: '',
                        pv_objname: this.props.OBJNAME,

                    },
                    new_create: true,
                    access: nextProps.access,
                    isDone: false,
                    idtype: 'IDTYPE'
                })
            }
    }
    componentDidMount() {

        // io.socket.post('/account/get_detail',{CUSTID:this.props.CUSTID_VIEW,TLID:"0009"}, function (resData, jwRes) {
        //     console.log('detail',resData)
        //     // self.setState({generalInformation:resData});

        // });
        window.$('#txtCustodycd').focus()
    }

    handleChange(type) {
        this.state.collapse[type] = !this.state.collapse[type];
        this.setState({ collapse: this.state.collapse })
    }
    onChange(type, event) {

        if (event.target) {

            this.state.datagroup[type] = event.target.value;
        }
        else {
            if (type == 'p_custtype') {
                if (this.state.datagroup["p_grinvestor"] == 'NN') {
                    if (event.value == 'TC') {
                        this.state.datagroup["p_idtype"] = '005'
                        this.state.datagroup[type] = event.value;
                    }
                    else {
                        this.state.datagroup["p_idtype"] = '002'
                        this.state.datagroup[type] = event.value;
                    }
                } else if (this.state.datagroup["p_grinvestor"] == 'TN') {
                    if (event.value == 'TC') {
                        this.state.datagroup["p_idtype"] = '005'
                        this.state.datagroup[type] = event.value;

                    } else {
                        this.state.datagroup["p_idtype"] = '001'
                        this.state.datagroup[type] = event.value;

                    }
                }
            }
            else if (type == 'p_grinvestor') {
                //  console.log(this.state.datagroup["p_grinvestor"])
                if (event.value == 'NN') {
                    if (this.state.datagroup["p_custtype"] == 'CN') {
                        this.state.datagroup["p_idtype"] = '002'
                        this.state.datagroup[type] = event.value;
                    }
                    else {
                        this.state.datagroup["p_idtype"] = '005'
                        this.state.datagroup[type] = event.value;
                    }
                } else {
                    if (this.state.datagroup["p_custtype"] == 'TC') {
                        this.state.datagroup["p_idtype"] = '005'
                        this.state.datagroup[type] = event.value;

                    } else {
                        this.state.datagroup["p_idtype"] = '001'
                        this.state.datagroup[type] = event.value;

                    }

                }
            }
            else this.state.datagroup[type] = event.value;
        }
        this.setState({ datagroup: this.state.datagroup })
    }
    onSetDefaultValue = (type, value) => {

        if (!this.state.datagroup[type])
            this.state.datagroup[type] = value
    }
    async submitGroup() {

        var mssgerr = '';
        for (let index = 0; index < this.state.checkFields.length; index++) {
            const element = this.state.checkFields[index];
            mssgerr = this.checkValid(element.name, element.id);
            if (mssgerr !== '')
                break;
        }
        if (mssgerr == '') {
            var api = '/account/addcfmastvip';
            if (this.state.access == "update") {
                api = '/account/updatecfmastvip';
            }

            var { dispatch } = this.props;
            var datanotify = {
                type: "",
                header: "",
                content: ""

            }

            console.log('Hieu======>', this.state.datagroup)
            RestfulUtils.posttrans(api, this.state.datagroup)
                .then((res) => {

                    if (res.EC == 0) {
                        datanotify.type = "success";
                        datanotify.content = this.props.strings.success;
                        dispatch(showNotifi(datanotify));
                        this.props.load()
                        this.props.closeModalDetail()
                    } else {
                        datanotify.type = "error";
                        datanotify.content = res.EM;
                        dispatch(showNotifi(datanotify));
                    }

                })
        }

    }



    checkValid(name, id) {
        let value = this.state.datagroup[name];
        let mssgerr = '';
        switch (name) {
            case "p_custodycd":
                if (value == '') {
                    mssgerr = this.props.strings.requiredcustodycd;
                } else {
                    if (value.length == 10) {
                        var i = ['C', 'F', 'P'].filter(nodes => nodes == value.substr(3, 1))
                        if (i == 0)
                            mssgerr = this.props.strings.checkcustodycd;
                    } else mssgerr = this.props.strings.checkcustodycd;
                }
                break;
            case "p_fullname":
                if (value == '') {
                    mssgerr = this.props.strings.requiredfullname;
                }
                break;
            case "p_idcode":
                if (value == '') {
                    mssgerr = this.props.strings.requiredidcode;
                }
                break;

            default:
                break;
        }
        if (mssgerr !== '') {
            var { dispatch } = this.props;
            var datanotify = {
                type: "",
                header: "",
                content: ""

            }
            datanotify.type = "error";
            datanotify.content = mssgerr;
            dispatch(showNotifi(datanotify));
            window.$(`#${id}`).focus();
        }
        return mssgerr;
    }

    render() {
        console.log('Hieu========>', this.state.datagroup)
        var cdname = ''
        var displayyIDTYPE = false
        if ((this.state.datagroup["p_custtype"] == '' || this.state.datagroup["p_custtype"] == 'CN') && (this.state.datagroup["p_grinvestor"] == '' || this.state.datagroup["p_grinvestor"] == 'TN')) {
            cdname = 'IDTYPETNCN'
        } else if (this.state.datagroup["p_custtype"] == 'TC' && this.state.datagroup["p_grinvestor"] == 'TN') {
            cdname = 'IDTYPETKSD'
            displayyIDTYPE = true
        } else if (this.state.datagroup["p_grinvestor"] == 'NN') {
            cdname = 'IDTYPETKSD'
            displayyIDTYPE = true
        }
        let displayy = this.state.access == 'update'  ? true : false

        return (
            <Modal show={this.props.showModalDetail} >
                <Modal.Header >
                    <Modal.Title ><div className="title-content col-md-6">{this.props.title} <button type="button" className="close" onClick={this.close.bind(this)}><span aria-hidden="true">×</span><span className="sr-only">Close</span></button></div></Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: "auto", height: "100%" }}>

                    <div className="panel-body ">
                        <div className="add-info-account">
                            <div className={this.state.access == "view" ? "col-md-12 disable" : "col-md-12 "} style={{ paddingTop: "11px" }}>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5 className="highlight"><b>{this.props.strings.custodycd}</b></h5>
                                    </div>
                                    <div className="col-md-5">
                                        <input maxLength={20} disabled={displayy} className="form-control" type="text" placeholder={this.props.strings.custodycd} id="txtCustodycd" value={this.state.datagroup["p_custodycd"]} onChange={this.onChange.bind(this, "p_custodycd")} />

                                    </div>
                                </div>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.fullname}</b></h5>
                                    </div>
                                    <div className="col-md-9">
                                        <input maxLength={500} className="form-control" type="text" placeholder={this.props.strings.fullname} id="txtFullname" value={this.state.datagroup["p_fullname"]} onChange={this.onChange.bind(this, "p_fullname")} />
                                    </div>
                                </div>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.grinvestor}</b></h5>
                                    </div>
                                    <div className="col-md-5">
                                        <DropdownFactory disabled={displayy} CDVAL={this.state.datagroup["p_grinvestor"]} onSetDefaultValue={this.onSetDefaultValue} onChange={this.onChange.bind(this)} value="p_grinvestor" CDTYPE="CF" CDNAME="GRINVESTOR" ID="drdGRINVESTOR" />
                                    </div>
                                </div>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.custtype}</b></h5>
                                    </div>
                                    <div className="col-md-5">
                                        <DropdownFactory CDVAL={this.state.datagroup["p_custtype"]} onSetDefaultValue={this.onSetDefaultValue} onChange={this.onChange.bind(this)} value="p_custtype" CDTYPE="CF" CDNAME="CUSTTYPE" ID="drdCUSTTYPE" />
                                    </div>
                                </div>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.idtype}</b></h5>
                                    </div>
                                    <div className="col-md-5">
                                        <DropdownFactory isrefesh="true"  CDVAL={this.state.datagroup["p_idtype"]} disabled={displayyIDTYPE} onSetDefaultValue={this.onSetDefaultValue} onChange={this.onChange.bind(this)} value="p_idtype" CDTYPE="CF" CDNAME={cdname} ID="drdIdtype" />
                                    </div>
                                </div>
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.idcode}</b></h5>
                                    </div>
                                    <div className="col-md-5">
                                        <input maxLength={30} className="form-control" type="text" placeholder={this.props.strings.idcode} id="txtIdcode" value={this.state.datagroup["p_idcode"]} onChange={this.onChange.bind(this, "p_idcode")} />
                                    </div>
                                </div>
                                {/*
                                <div className="col-md-12 row">
                                    <div className="col-md-3">
                                        <h5><b>{this.props.strings.desc}</b></h5>
                                    </div>
                                    <div className="col-md-9">
                                        <input className="form-control" type="text" placeholder={this.props.strings.desc} id="txtDesc" value={this.state.datagroup["p_desc"]} onChange={this.onChange.bind(this, "p_desc")} />

                                    </div>
                                </div>
        */}
                                <div className="col-md-12 row">
                                    <div className="pull-right">

                                        <input type="button" onClick={this.submitGroup.bind(this)} className="btn btn-primary" style={{ marginRight: 15 }} value={this.props.strings.submit} id="btnSubmit" />

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
const stateToProps = state => ({
    lang: state.language.language
});
const decorators = flow([
    connect(stateToProps),
    translate('ModalDetailTKGDDep_info')
]);
module.exports = decorators(ModalDetailTKGDDep_info);
// export default ModalDetail;
