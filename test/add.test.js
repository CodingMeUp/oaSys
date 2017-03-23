var add = require('../client/test-src/add.js');

	//  一个或多个describe块 describe块称为"测试套件"（test suite），表示一组相关的测试。
// 它是一个函数，第一个参数是测试套件的名称（"加法函数的测试"），第二个参数是一个实际执行的函数。

describe('加法函数的测试', function() {

	// 每个describe块应该包括一个或多个it块。 it块称为"测试OA"（test case），表示一个单独的测试，是测试的最小单位。
	// 它也是一个函数，第一个参数是测试OA的名称（"1 加 1 应该等于 2"），第二个参数是一个实际执行的函数。
  it('1 加 1 应该等于 2', function() {
  	var result = add(1,1);
		//   	add(1, 1)，结果应该等于2。
		// 所有的测试OA（it块）都应该含有一句或多句的断言	 断言库有很多种，Mocha并不限制使用哪一种。上面代码引入的断言库是chai
    expect(result).to.be.equal(2);
  });


});
