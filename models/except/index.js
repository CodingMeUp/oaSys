var
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    co = require('co'),
    Schema = mongoose.Schema;

mongoose.connect(C.db.url, C.db.opts); // 创建链接



fs.readdirSync(C.dir.model).forEach(function (name) { // 遍历所有model，目前暂时没有2级目录
    if (path.extname(name) !== '') {
        name = path.basename(name, '.js');
        //M[name] = mongoose.model(name, new Schema(require(path.join(C.dir.model, name))(Schema)), name);
        M[name] = mongoose.model(name, require(path.join(C.dir.model, name)), name);
    }
});

// var result =  yield M.procedure('create','defaultProcedure111','function(){ return 2;}');
// var result =  yield M.procedure('excute','defaultProcedure');
// console.log(result);
// mongoose 存储过程 新建和执行等
M['procedure'] = function(type,funName,funMain){
	   return co(function* () {
				if(type == 'create'){
					var insertValue  =  yield M['system.js'].findOne({_id:"defaultProcedure"});
		      insertValue.value.code = '';
		      insertValue.value.code += funMain;
		      yield M['system.js'].create({_id:funName,value:insertValue.value});
				}else if(type == 'excute'){
						// mongoose.connection.on('connected', function(){});
				  try{
				  	var result =  yield mongoose.connection.db.eval(funName);
				  	if(result.error){
					  	return result.error;
					  }else{
					  	return result;
					  }
				  }catch(e){
				  	  return e;
				  }

				}
				return;
		});
}
