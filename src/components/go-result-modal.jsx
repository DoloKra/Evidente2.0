import React, {Component} from "react";
import Modal from 'react-bootstrap/Modal';
import ModalDialog from 'react-bootstrap/ModalDialog';
import Button from "react-bootstrap/Button";
import Table from './go-table';
import TableHeader from './go-table-header';
import MyButton from './my-button';
import "./test_styles.css"



class GOResultModal extends Component{
    constructor (props) {
        super(props);
        this.showGoTerms = this.showGoTerms.bind(this)
        this.hideGoTerms = this.hideGoTerms.bind(this)
        this.showSNPsforGoTerm = this.showSNPsforGoTerm.bind(this)

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
        pValuesShow :Array.from({length:this.props.go_result.length+1}).map(x => false),
        snpsShow :Array.from({length:this.props.go_result.length+1}).map(x => false),
    };
    
    createTableInputFormat(go_result){
        var id = 0;
        var input = [];
        go_result.forEach(go => {
            var row_dict = {};
            row_dict["id"] = id;
            row_dict["go_term"] = go[0];
            row_dict["description"] = go[2];
            row_dict["p_value"] = Math.round(go[1] * 10000) / 10000  // 3.14go[1];
            id++;
            input.push(row_dict)
        });
        console.log(input);
        return input;
      
  }
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
  
  showSNPsforGoTerm(go_term){
      console.log("in show Snps: ");
      console.log(this.props.go_to_snps);
      console.log("go term", go_term);
      var snps = this.props.go_to_snps[go_term];
        console.log("snps? ",this.props.go_to_snps[go_term]);

      if (snps != undefined){
        this.props.handleMultipleSNPadditon(snps);
      }
  }
          
      

   render() {
    
    console.log("go-terms?",this.state.goTermsShow);
	
    return (
        //statistics dialog
        //can be extended by adding additional modals as shown for GO enrichment
    <div className="container">
   
    <Modal
        id = "go-result-modal"
        subtree_size = {this.props.subtree_size}
        show={this.props.show}
        onHide={this.props.handleClose}
        backdrop="static"
        //keyboard={false}
        centered
        scrollable
        dialogClassName = 'custom-dialog'
       >
        <Modal.Header closeButton>
          <Modal.Title>GO enrichment result</Modal.Title>
        </Modal.Header>
        <div style={{margin:15}} >
           Found {this.props.numOfSigGoTerms} significant GO terms
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
            <TableHeader/> 
            )}
        
        <Modal.Body className = "body">
            {this.state.goTermsShow&&(
                <Table handleMultipleSNPadditon = {this.props.handleMultipleSNPadditon} showSNPsforGoTerm= {this.showSNPsforGoTerm} snpsShow={this.state.snpsShow} input = {this.state.tableInput}/>
            )}
        </Modal.Body>
        <Modal.Footer>
        <div id='container'style={{marginTop:0, marginBottom:10, padding:0}}>
            <div id='subtree'style={{ float:'left', marginRight:100}}>
                subtree-size: {this.props.subtree_size}<br/>
                SNPs: {this.props.subtree_snps}
            </div>
            <div id='tree'style={{width:440,marginRight:0,padding:0}}>
              <Button id="export" variant='light' onClick={this.props.exportGoResult}style={{ marginLeft:40,float:'right'}} >
               Export Results
             </Button>
                tree-size: {this.props.tree_size}<br/>
                SNPs: {this.props.tree_snps}
               
            </div>
           
        </div>
        </Modal.Footer>
    </Modal>
</div>
    
);
       
}}


export default GOResultModal

