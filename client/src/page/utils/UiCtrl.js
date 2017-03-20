import * as _ from 'lodash';

const UiCtrl = {
  scrollToTop: function () {
    let adminContent = document.getElementsByClassName('admin-page-content');
    if (!_.isEmpty(adminContent)) {
      adminContent = adminContent[0];
      
      var x = adminContent.scrollTop;
      var timer = setInterval(function () {
        x = x - 200;
        if (x < 200) {
          x = 0;
          adminContent.scrollTop = x;
          clearInterval(timer);
        }
        adminContent.scrollTop = x;
      }, 80);
    }
  }
}

export default UiCtrl;