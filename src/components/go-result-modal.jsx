// File: go-result-modal.jsx
// Pop-Up-window for visualization of go-enrichment results
// Written by Sophie Pesch 2021


import React from "react";
import {Component} from "react";
import Modal from 'react-bootstrap/Modal';
import ModalDialog from 'react-bootstrap/ModalDialog';
import Draggable from "react-draggable";

import Button from "react-bootstrap/Button";
import Table from './go-table';
import TableHeader from './go-table-header';
import MyButton from './my-button';
import "./test_styles.css"


class DraggableModalDialog extends React.Component {
  render() {
    return (
      <Draggable handle=".modal-header">
	<ModalDialog {...this.props} />
      </Draggable>
    );
  }
}

class GOResultModal extends Component{
  constructor (props) {
    super(props);
    this.showGoTerms = this.showGoTerms.bind(this)
    this.hideGoTerms = this.hideGoTerms.bind(this)
    this.showSNPsforGoTerm = this.showSNPsforGoTerm.bind(this)
    this.hideSNPsforGoTerm = this.hideSNPsforGoTerm.bind(this)
    this.downloadCSV = this.downloadCSV.bind(this)
    this.exportGoResult = this.exportGoResult.bind(this)
    this.hideSNPs = this.hideSNPs.bind(this)
    this.markSelectedClade = this.markSelectedClade.bind(this)
    this.unmarkSelectedClade = this.unmarkSelectedClade.bind(this)
    this.get_clade_leaves = this.get_clade_leaves.bind(this)

  }
  state = {
    tableInput: this.createTableInputFormat(this.props.go_result),
    // [{id: 0, go_term: "GO22222", description: "this is a test", p_value: 0.004},
    // {id: 1, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 2, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 3, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 4, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 5, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 6, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 7, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 8, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 9, go_term: "GO22222", description: "this is a test", p_value : 0.004},
    // {id: 10, go_term: "GO22222", description: "this is a test", p_value : 0.004}],
    goTermsShow : false,
    subtreeMarked: false,
    pValuesShow :Array.from({length:this.props.go_result.length+1}).map(x => false),
    snpsShow :Array.from({length:this.props.go_result.length+1}).map(x => false),
  };

  //fills input for go-term table
  createTableInputFormat(go_result){
    var id = 0;
    var input = [];
    go_result.forEach(go => {
      var row_dict = {};
      row_dict["id"] = id;
      row_dict["go_term"] = go[0];
      row_dict["description"] = go[2];
      row_dict["p_value"] = go[1]  // 3.14go[1];
      id++;
      input.push(row_dict)
    });
    console.log(input);
    return input;
  }

  //manage visibility of pop-up-window components
  showGoTerms () {
    this.setState({goTermsShow:true});
  }

  hideGoTerms () {
    this.setState({goTermsShow:false});
  }

  showPValue(id){
    var curr_state = this.state.pValuesShow;
    curr_state[id] = true;
    this.setState({pValuesShow:curr_state});
  }
  
  hidePValue(id){
    var curr_state = this.state.pValuesShow;
    curr_state[id] = false;
    this.setState({pValuesShow:curr_state})
  }

  //visualize snps associated with given go term in tree viusalization
  showSNPsforGoTerm(go_term, id){
    console.log(this.props.go_to_snps);
    var snps = this.props.go_to_snps[go_term];
    if (snps !== undefined){
      this.props.handleMultipleSNPadditon(snps);
    }
    var curr_state = this.state.snpsShow;
    curr_state[id] = true;
    this.setState({snpsShow:curr_state})
  }

  //hide snps associated with given go-term in tree visulization
  hideSNPsforGoTerm(go_term, id){
    var snps = this.props.go_to_snps[go_term];
    if (snps !== undefined){
      this.props.handleHideSNPs(snps)
    }
    var curr_state = this.state.snpsShow;
    curr_state[id] = false;
    this.setState({snpsShow:curr_state})
  }

  //hide all visualized snps
  hideSNPs(){
    var snps = this.props.visualizedSNPs;
    if (snps !== undefined){
      this.props.handleHideSNPs(snps);
    }
    var snpsShow = Array.from({length:this.props.go_result.length+1}).map(x => false);
    this.setState({snpsShow:snpsShow});
  }

  //mark branches of selected clade in tree visualization
  markSelectedClade(){
    console.log("test:",this.props.clade[1]);
    this.props.tree.modify_selection(
        this.props.clade[1],
        undefined,
        undefined,
        undefined,
        "true",
      );
     this.setState({subtreeMarked:true})
  }
  //remove mark of selected clade in tree visualization
  unmarkSelectedClade(){
      this.props.tree.modify_selection(
      this.props.clade[1],
        undefined,
        undefined,
        undefined,
        "false",
      );
      this.setState({subtreeMarked:false})

  }
  //get leaves of analysed clade
  get_clade_leaves(){
    console.log(this.props.root);
    if(this.props.tree.is_leafnode(this.props.root)){
        return [this.props.root.name]
    }
    else{
        const leaves = this.props.tree.select_all_descendants(this.props.root, true, false);
        const names = leaves.map(leave => String(leave.name));
        //console.log("leaves: ", leaves);
        return names;
    }
  }

   //provides export of go-result
   exportGoResult(){
    // var csv = ["a,b,c\n"]
    var csv = this.createCSV(this.props.go_result);
    this.downloadCSV(csv,"enrichment_result.csv");

  }

  //provides download of go-enrichment result as csv file
  downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();

  }

  //create csv format of go result
  createCSV(go_result){
    var clade = this.get_clade_leaves();
    var csv = "";
    clade.join();
    csv += clade +'\n'
    go_result.forEach(go => {
      csv += '"'+go[0]+'","'+go[2]+'","'+go[1]+'"\n'
    });
    return [csv];
  }

  render() {
    return (
      <div className="container">
        <Modal
              dialogAs={DraggableModalDialog}
              id = "go-result-modal"
              subtree_size = {this.props.subtree_size}
              show={this.props.show}
              onHide={this.props.handleClose}
              backdrop={'static'}
              //keyboard={false}
              centered
              scrollable
              dialogClassName = 'custom-dialog'
          >
          <Modal.Header closeButton>
            <Modal.Title>GO enrichment result</Modal.Title>
          </Modal.Header>
          <div style={{margin:15}} >
            Found {this.props.numOfSigGoTerms} significant GO term(s)
                {! (this.state.goTermsShow)&&(
              <MyButton onClick={this.showGoTerms} text='show terms'/>
                )}
          {this.state.goTermsShow&&(
            <Button id= "go-terms" variant= "light" onClick={this.hideGoTerms} style={{float:'right'}}>
              hide terms
            </Button>
          )}
          </div>
        {this.state.goTermsShow&&(
          <TableHeader hideSNPs = {this.hideSNPs}/>
        )}

        <Modal.Body className = "body">
        {this.state.goTermsShow&&(
          <Table hideSNPsforGoTerm = {this.hideSNPsforGoTerm} handleMultipleSNPadditon = {this.props.handleMultipleSNPadditon}
            showSNPsforGoTerm= {this.showSNPsforGoTerm} snpsShow={this.state.snpsShow} input = {this.state.tableInput}/>
        )}
          </Modal.Body>
            <Modal.Footer>
                <div id='container'style={{marginTop:0, marginBottom:10, padding:0}}>
                    <div id='subtree'style={{ float:'left', marginRight:5}}>
                        {!(this.state.subtreeMarked)&&(
                            <Button id="export" variant='light' onClick={this.markSelectedClade} style={{ marginLeft:20,float:'right'}} >
                            mark subtree
                            </Button>
                            )
                        }
                        {this.state.subtreeMarked&&(
                            <Button id="export" variant='light' onClick={this.unmarkSelectedClade} style={{ marginLeft:20,float:'right'}} >
                            unmark subtree
                            </Button>
                            )
                        }
                        <div style={{float:'left', marginLeft:0}}>
                        subtree-size: {this.props.subtree_size}<br/>
                        SNPs: {this.props.subtree_snps}<br/>
                        in Genes: {this.props.in_gene_clade}
                        </div>
                    </div >
                    <div id='tree'style={{width:480,marginRight:0,padding:0}}>
                        <Button id="export" variant='light' onClick={this.exportGoResult} style={{ marginLeft:20,float:'right'}} >
                        Export Results
                        </Button>
                         <div style={{float:"right", marginRight:1}}>
                        tree-size: {this.props.tree_size}<br/>
                        SNPs: {this.props.tree_snps}<br/>
                        in Genes: {this.props.in_gene_tree}
                        </div>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
	</div>

      
    );
    
  }
}


export default GOResultModal

