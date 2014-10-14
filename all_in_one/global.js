function call_23(state_id){
	namespace2.call(state_id);
	//namespace3.call(state_id);
	call3(state_id, val_option);
}

// set a global variable so we can use in other 
// 'onclick' functions
var val_option = 'tp';
function valchange(sel) {
	//resetcolor();
	val_option = sel.value;
	onchange1(sel.value);
    onchange2(sel.value);
    call3("", sel.value);
}