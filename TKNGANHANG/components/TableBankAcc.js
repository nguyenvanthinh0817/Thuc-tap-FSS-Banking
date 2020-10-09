import React, { Component } from "react";
import ReactTable from "react-table";
import { Checkbox } from "react-bootstrap";
import {
  ButtonAdd,
  ButtonDelete,
  ButtonExport,
} from "app/utils/buttonSystem/ButtonSystem";
import flow from "lodash.flow";
import translate from "app/utils/i18n/Translate.js";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import RestfulUtils from "app/utils/RestfulUtils";
import {
  DefaultPagesize,
  getExtensionByLang,
  getRowTextTable,
  getPageTextTable,
} from "app/Helpers";
import { requestData } from "app/utils/ReactTableUlti";

class TableBankAcc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listColTextalign: ["BALANCE", "ACCOUNT", "BIRTHDATE"],

      data: [],
      pages: null,
      loading: true,
      checkedAll: false,
      checkboxChecked: false,
      selectedRows: new Set(),
      unSelectedRows: [],

      pagesize: DefaultPagesize,
      keySearch: {},
      sortSearch: {},
      page: 1,
      dataTest: [],
      data1: [],
      loaded: false,

      sorted1: [],
      filtered1: [],
      firstRender: true,
      lang: this.props.lang,
    };
    // this.fetchData = this.fetchData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.lang != nextProps.currentLanguage) {
      this.state.lang = nextProps.currentLanguage;
      this.refReactTable.fireFetchData();
    }
    if (nextProps.loadgrid) {
      this.state.firstRender = true;
      this.refReactTable.fireFetchData();
    }
  }
   formatNumber = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  

  handleAdd(evt) {
    var that = this;
    that.props.showModalDetail("ADD");
  }
  handlEdit(data) {
    var that = this;
    that.props.showModalDetail("EDIT", data);
  }
  handleChangeALL(evt) {
    var that = this;
    this.setState({
      checkedAll: evt.target.checked,
      selectedRows: new Set(),
      unSelectedRows: [],
    });
    if (evt.target.checked) {
      that.state.data.map(function (item) {
        if (!that.state.selectedRows.has(item.AUTOID)) {
          if (item.PSTATUS === null) {
            if (item.STATUS != "A") {
              that.state.selectedRows.add(item.AUTOID);
              that.state.unSelectedRows.push(item.AUTOID);
            }
          } else {
            if (item.STATUS != "A" && item.PSTATUS.indexOf("A") < 0) {
              that.state.selectedRows.add(item.AUTOID);
              that.state.unSelectedRows.push(item.AUTOID);
            }
          }
        }
      });
      that.setState({
        selectedRows: that.state.selectedRows,
        unSelectedRows: that.state.unSelectedRows,
      });
    } else {
      //that.state.unSelectedRows.map(function (item) {
      //  that.state.selectedRows.delete(item);
      // })
      that.setState({ selectedRows: new Set(), unSelectedRows: [] });
    }
  }

  handleChange(row) {
    if (!this.state.selectedRows.has(row.original.AUTOID))
      this.state.selectedRows.add(row.original.AUTOID);
    else {
      this.state.selectedRows.delete(row.original.AUTOID);
    }
    this.setState({ selectedRows: this.state.selectedRows, checkedAll: false });
  }
  onRowClick(state, rowInfo, column, instance) {
    var that = this;
    return {
      onDoubleClick: (e) => {
        that.props.showModalDetail("VIEW", rowInfo.original);
      },
      style: {
        background:
          rowInfo == undefined
            ? ""
            : that.state.selectedRows.has(rowInfo.original.AUTOID)
            ? "#dbe1ec"
            : "",
        color:
          rowInfo == undefined
            ? ""
            : that.state.selectedRows.has(rowInfo.original.AUTOID)
            ? "black"
            : "",
      },
      // onClick: (e, handleOriginal) => {
      //     console.log('A Td Element was clicked!')
      //     console.log('it produced this event:', e)
      //     console.log('It was in this column:', column)
      //     console.log('It was in this row:', rowInfo)
      //     console.log('It was in this table instance:', instance)

      //     // IMPORTANT! React-Table uses onClick internally to trigger
      //     // events like expanding SubComponents and pivots.
      //     // By default a custom 'onClick' handler will override this functionality.
      //     // If you want to fire the original onClick handler, call the
      //     // 'handleOriginal' function.
      //     if (handleOriginal) {
      //       handleOriginal()
      //     }
      //   }
    };
  }

  fetchData(state, instance) {
    let that = this;
    if (this.state.firstRender) {
      let data = {
        p_language: this.props.lang,
        OBJNAME: "THINHBACKACC",
      };
      RestfulUtils.posttrans("/banking/getListBankAcc", { ...data }).then(
        (resData) => {
          // console.log('rs',resData.data.DT.data)
          // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
          if (resData.EC == 0) {
            requestData(
              state.pageSize,
              state.page,
              state.sorted,
              state.filtered,
              resData.DT.data
            ).then((res) => {
              // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
              this.setState({
                data: res.rows,
                pages: res.pages,
                // loading: false,
                firstRender: false,
                dataALL: resData.DT.data,
                selectedRows: new Set(),
                checkedAll: false,
                sumRecord: resData.DT.data.length,
                colum: instance.props.columns,
              });
            });
          }
        }
      );
    } else {
      requestData(
        state.pageSize,
        state.page,
        state.sorted,
        state.filtered,
        this.state.dataALL
      ).then((res) => {
        (this.state.data = res.rows),
          (this.state.pages = res.pages),
          (this.state.colum = instance.props.columns);
        // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
        this.setState(that.state);
      });
    }
  }
  reloadTable() {
    this.state.firstRender = true;
    this.refReactTable.fireFetchData();
  }

  delete = () => {
    let i = 0;
    if (this.state.selectedRows.size > 0) {
      this.state.selectedRows.forEach((key, value, set) => {
        new Promise((resolve, reject) => {
          let data = this.state.data.filter((e) => e.AUTOID === value);
          let success = null;
          let datadelete = {
            p_autoid: data[0].AUTOID,
            p_custodycd: data[0].CUSTODYCD,
            p_account: data[0].ACCOUNT,
            p_balance: data[0].BALANCE,
            p_bankcode: data[0].BANKCODE,
            p_type: data[0].TYPE,
            pv_language: this.props.lang,
            pv_objname: this.props.OBJNAME,
            pv_action: "DELETE",
          };
          resolve(
            RestfulUtils.posttrans(
              "/banking/processingBankAcc",
              datadelete
            ).then((res) => {
              i += 1;

              success = res.EC == 0;
              success
                ? toast.success(this.props.strings.success, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  })
                : toast.error(this.props.strings.fail + " " + res.EM, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  });
              if (this.state.selectedRows.size == i) {
                this.state.firstRender = true;
                this.refReactTable.fireFetchData();
              }
            })
          );
        });
      });
    } else
      toast.error(this.props.strings.warningchooserecord, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
  };
  ///////////////////////////////
  checkStatus = (status, pstatus) => {
    if (pstatus === null) {
      if (status == "A") {
        return true;
      } else {
        return false;
      }
    } else {
      if (status == "A" || pstatus.indexOf("A") > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  showSpanEdit = (that, original, checkStatus) => {
    let xhtml = "";
    if (checkStatus == true) {
      return (xhtml = (
        <span
          className="glyphicon glyphicon-pencil"
          style={{ cursor: "not-allowed" }}
        ></span>
      ));
    } else {
      return (xhtml = (
        <span
          onClick={that.handlEdit.bind(that, original)}
          className="glyphicon glyphicon-pencil"
        ></span>
      ));
    }
  };

  setColTextalign = (colName) => {
    const col = this.state.listColTextalign.find((item) => item == colName);
    let xhtml = "right";
    if (!col) {
      xhtml = "left";
    }
    return xhtml;
  };
  /////////////////////////////////
  render() {
    const { data, pages, pagesize } = this.state;
    var that = this;
    return (
      <div>
        <div className="row">
          <div
            style={{ marginLeft: "-12px", marginBottom: "10px" }}
            className="col-md-10 "
          >
            <ButtonAdd
              style={{ marginLeft: "5px" }}
              data={this.props.datapage}
              onClick={this.handleAdd.bind(this)}
            />
            <ButtonDelete
              style={{ marginLeft: "5px" }}
              onClick={this.delete}
              data={this.props.datapage}
            />
            <ButtonExport
              style={{ marginLeft: "5px" }}
              HaveChk={true}
              dataRows={this.state.data}
              colum={this.state.colum}
              data={this.props.datapage}
              dataHeader={this.props.strings}
            />
          </div>
          <div style={{ textAlign: "right" }} className="col-md-2 RightInfo">
            <h5 className="highlight" style={{ fontWeight: "bold" }}>
              {" "}
              <span
                style={{ textAlign: "left" }}
                className="glyphicon glyphicon-edit"
                aria-hidden="true"
              ></span>{" "}
              {this.props.strings.sumtitle} {this.state.sumRecord}
              <span
                className="ReloadButton"
                onClick={this.reloadTable.bind(this)}
              >
                <i className="fas fa-sync-alt"></i>
              </span>
            </h5>
          </div>
          {/* <ButtonSytem onClick={this.onClick.bind(this)} listbusiness={this.props.listbusiness} /> */}
          {/* <button style={{ marginLeft: "5px" }} className="btn btn-primary" onClick={that.handleAdd.bind(that)}><span className="glyphicon glyphicon-plus-sign"></span> Tạo mới</button>

                        <button style={{ marginLeft: "5px" }} className="btn btn-success" onClick={this.approve}><span className="glyphicon glyphicon-ok"></span> Duyệt</button>
                        <button style={{ marginLeft: "5px" }} className="btn btn-default" onClick={this.reject}><span className="glyphicon glyphicon-minus"></span> Từ chối</button>

                     <button style={{ marginLeft: "5px" }} className="btn btn-danger" onClick={this.delete}><span className="glyphicon glyphicon-remove"></span> Hủy</button>  */}

          {/* <button style={{ marginLeft: "5px",float:"right" }} className="btn btn-default" onClick={this.refreshData}><span className="glyphicon glyphicon-refresh"></span> Làm mới</button> */}
        </div>

        <div className="col-md-12">
          <ReactTable
            columns={[
              {
                Header: (props) => (
                  <div className=" header-react-table">
                    {" "}
                    <Checkbox
                      checked={that.state.checkedAll}
                      style={{ marginBottom: "14px", marginLeft: "11px" }}
                      onChange={that.handleChangeALL.bind(that)}
                      inline
                    />
                  </div>
                ),
                maxWidth: 55,
                sortable: false,
                style: { textAlign: "center" },
                Cell: (row) => (
                  <div>
                    <Checkbox
                      disabled={this.checkStatus(
                        row.original.STATUS,
                        row.original.PSTATUS
                      )}
                      style={{
                        textAlign: "center",
                        marginLeft: "11px",
                        marginTop: "-14px",
                      }}
                      checked={that.state.selectedRows.has(row.original.AUTOID)}
                      onChange={that.handleChange.bind(that, row)}
                      inline
                    />
                    {this.showSpanEdit(
                      that,
                      row.original,
                      this.checkStatus(
                        row.original.STATUS,
                        row.original.PSTATUS
                      )
                    )}
                  </div>
                ),
                Filter: ({ filter, onChange }) => null,
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="lblCustodycd">
                    {this.props.strings.CUSTODYCD}
                  </div>
                ),
                id: "CUSTODYCD",
                accessor: "CUSTODYCD",
                width: 150,
                Cell: ({ value }) => (
                  <div
                    className="col-left"
                    style={{ float: "left" }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },

              {
                Header: (props) => (
                  <div className="wordwrap" id="lblBirthdate">
                    {this.props.strings.BIRTHDATE}
                  </div>
                ),
                id: "BIRTHDATE",
                accessor: "BIRTHDATE",
                width: 100,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("BIRTHDATE")}
                    style={{ float: this.setColTextalign("BIRTHDATE") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },

              {
                Header: (props) => (
                  <div className="wordwrap" id="lblAddress">
                    {this.props.strings.ADDRESS}
                  </div>
                ),
                id: "ADDRESS",
                accessor: "ADDRESS",
                width: 200,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("ADDRESS")}
                    style={{ float: this.setColTextalign("ADDRESS") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="lblBankName">
                    {this.props.strings.BANKNAME}
                  </div>
                ),
                id: "BANKNAME",
                accessor: "BANKNAME",
                width: 200,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("BANKNAME")}
                    style={{ float: this.setColTextalign("BANKNAME") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="lblAccount">
                    {this.props.strings.ACCOUNT}
                  </div>
                ),
                id: "ACCOUNT",
                accessor: "ACCOUNT",
                width: 200,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("ACCOUNT")}
                    style={{ float: this.setColTextalign("ACCOUNT") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="lblType">
                    {this.props.strings[getExtensionByLang("TYPEDES", this.props.lang)]}
                  </div>
                ),
                id: getExtensionByLang("TYPEDES", this.props.lang),
                accessor: getExtensionByLang("TYPEDES", this.props.lang),
                width: 100,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("TYPEDES")}
                    style={{ float: this.setColTextalign("TYPEDES") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
              {
                Header: (props) => (
                  <div className="wordwrap" id="lblBlance">
                    {this.props.strings.BALANCE}
                  </div>
                ),
                id: "BALANCE",
                accessor: "BALANCE",
                width: 200,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("BALANCE")}
                    style={{ float: this.setColTextalign("BALANCE") }}
                    id={"lbl" + value}
                  >
                    {this.formatNumber(value)}
                  </div>
                ),
              },

              {
                Header: (props) => (
                  <div className="wordwrap" id="lblStatusdes">
                    {this.props.strings.STATUSDES}
                  </div>
                ),
                id: getExtensionByLang("STATUSDES", this.props.lang),
                accessor: getExtensionByLang("STATUSDES", this.props.lang),
                width: 100,
                Cell: ({ value }) => (
                  <div
                    className={"col-" + this.setColTextalign("STATUSDES")}
                    style={{ float: this.setColTextalign("STATUSDES") }}
                    id={"lbl" + value}
                  >
                    {value}
                  </div>
                ),
              },
            ]}
            getTheadTrProps={() => {
              return {
                className: "head",
              };
            }}
            manual
            filterable
            pages={pages} // Display the total number of pages
            //  loading={loading} // Display the loading overlay when we need it
            onFetchData={this.fetchData.bind(this)}
            data={data}
            style={{
              maxHeight: "600px", // This will force the table body to overflow and scroll, since there is not enough room
            }}
            noDataText={this.props.strings.textNodata}
            pageText={getPageTextTable(this.props.lang)}
            rowsText={getRowTextTable(this.props.lang)}
            previousText={<i className="fas fa-backward" id="previous"></i>}
            nextText={<i className="fas fa-forward" id="next"></i>}
            // loadingText="Đang tải..."
            ofText="/"
            getTrGroupProps={(row) => {
              return {
                id: "haha",
              };
            }}
            getTrProps={this.onRowClick.bind(this)}
            defaultPageSize={pagesize}
            className="-striped -highlight"
            // onPageChange={(pageIndex) => {
            //     this.state.selectedRows = new Set(),
            //         this.state.checkedAll = false
            // }
            // }
            ref={(refReactTable) => {
              this.refReactTable = refReactTable;
            }}
          />
        </div>
      </div>
    );
  }
}

TableBankAcc.defaultProps = {
  strings: {
    TTBT: "Chờ TTBT",
    quyen: "Quyền chờ về",
    desc: "Diễn giải",
    pageText: "Trang",

    rowsText: "bản ghi",
    textNodata: "Không có kết quả",
    vsdstatus: "Trạng thái VSD",
  },
};
const stateToProps = (state) => ({
  veryfiCaptcha: state.veryfiCaptcha,
  notification: state.notification,
  lang: state.language.language,
});

const decorators = flow([connect(stateToProps), translate("BankAcc")]);

module.exports = decorators(TableBankAcc);
