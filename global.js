function call_23(state_id){
	namespace2.call(state_id);
	//namespace3.call(state_id);
	call3(state_id, val_option);
}

// set a global variable so we can use in other 
// 'onclick' functions
var val_option = 'tp';
function valchange(sel) {
	val_option = sel;
	onchange1(sel);
    onchange2(sel);
    call3("", sel);
}

function bubblechange(sel){
	str = "Total_Payments";
	if(sel=='td') str = "Total_Discharge";
	if(sel=='tpd') str = 'Total_Payments_per_Discharge';
	resize_bubble(str);
}

function nowchange(){
	var sel = this.value;
	if(sel.substr(0,1)=='b'){
		bubblechange(sel.substr(1, sel.length-1));
	}
	else{
		valchange(sel);
	}
}