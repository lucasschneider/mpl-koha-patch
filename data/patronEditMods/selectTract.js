var addr = document.getElementById('address');
if (addr !== null) {
  addr.addEventListener('blur', queryCensusTract);
  var notice = document.createElement('div');
  notice.id = 'tractNotice';
  notice.setAttribute('style','margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
  addr.parentElement.appendChild(notice);
}
var city = document.getElementById('city');
if (city !== null) city.addEventListener('blur', queryCensusTract);

// COPIED FROM collegeExp.js
function fillDormExp() {
  var addr = document.getElementById('address');
  var addr2 = document.getElementById('address2');
  var zip = document.getElementById('zipcode');
  var expiry = document.getElementById('dateexpiry');
  
  if (zip !== null && addr !== null && expiry.value === '') {
    addrRegEx = /[ ]*15(10|20) tripp.*|[ ]*970 university.*|[ ]*(625|635|640|650) elm.*|[ ]*(35|420).{0,7}park.*|[ ]*1200 observatory.*|[ ]*16(35|50) kronshage.*|[ ]*(835|917|919|921).{0,6}dayton.*|[ ]*1950 willow.*|[ ]*(615|821|917).{0,6}johnson.*|[ ]*625 babcock.*/i;
    zipRegEx = /53706(\-[0-9]{4})?|53715(\-[0-9]{4})?/;
    var addressVal = addr2 !== null ? addr.value + " " + addr2.value : addr.value;
    if (zipRegEx.test(zip.value) && addrRegEx.test(addressVal)) {
      date = new Date();
      switch(parseInt(date.getUTCMonth())) {
      case 0:
      case 1:
      case 2:
     case 3:
        year = date.getUTCFullYear();
        break;
      case 4:
        if (parseInt(date.getUTCDate()) < 15) {
          year = date.getUTCFullYear();
        }
        break;
      default:
        year = (parseInt(date.getUTCFullYear())+1).toString();
        break;
      }
      expiry.value = "05/15/" + year;
    }
  }
}

// Select D-X-MAD form PSTAT select list
function selectXMAD(selectList) {
  if (selectList !== null) {
    var madUndIdx = 235; /* D-X-MAD index as of 9/11/2014 */
    if (selectList.children[madUndIdx].value === "D-X-MAD") {
      selectList.selectedIndex = madUndIdx;
    }
    else {
      for (var i = 0; i < selectList.length; i++) {
        if (selectList.children[i].value === "D-X-MAD") {
          selectList.selectedIndex = i;
          break;
        }
      }
      selectList.selectedIndex = i;
    }
  }
}

function selectMADTown(selectList) {
  if (selectList !== null) {
    var madTownIdx = 303; /* D-MAD-T index as of 9/11/2014 */
    if (selectList.children[madTownIdx].value === "D-MAD-T") {
      selectList.selectedIndex = madTownIdx;
    }
    else {
      for (var i = 0; i < selectList.length; i++) {
        if (selectList.children[i].value === "D-MAD-T") {
          selectList.selectedIndex = i;
          break;
        }
      }
      selectList.selectedIndex = i;
    }
  }
}

function trimAddr(addr) {
  addrParts = addr.split(" ");
  addrTrim = '';
  if (addrParts[0] !== undefined) addrTrim += encodeURIComponent(addrParts[0]);
  if (addrParts[1] !== undefined) addrTrim += "+" + encodeURIComponent(addrParts[1]);
  if (addrParts[2] !== undefined) addrTrim += "+" + encodeURIComponent(addrParts[2]);
  return addrTrim;
}

function queryCensusTract() {
  var addr = document.getElementById('address');
  var city = document.getElementById('city');
  var entryForm = document.forms.entryform;
  var selectList = (entryForm !== null) ? entryForm.elements.sort1 : null;
  var notice = document.getElementById('tractNotice');

  if (addr.value !== "" && city.value !== "" && zip !== null && selectList !== null) {
    var cityRegEx = /madison(,? wi(sconsin)?)?/i;
    if (cityRegEx.test(document.getElementById('city').value)) {
      // Generate loading message
      notice.textContent = "Searching for census tract and zipcode... ";
      var result = document.createElement('div');
      result.setAttribute('id','tractResult');
      notice.appendChild(result);
      result.textContent = '';
      setTimeout(function() {
      	var tr = document.getElementById('tractResult');
      	if (tr !== null && tr.textContent === '') {
	  tr.setAttribute('style','display:inline-block');
	  tr.textContent = '[NOTE: Server slow to respond—please enter zipcode and census tract manually]';
	}
      }, 6000);

      // Default to MAD UND if tract is empty
      if (selectList[selectList.selectedIndex] === "") selectXMAD(selectList);
      self.port.emit("queryTract", trimAddr(addr.value));
      self.port.on("receivedTract", function (addrTract) {
        var selected = false;
        if (addrTract !== null && addrTract.length === 4) {
	  var matchAddr = addrTract[0]
	  zip.value = addrTract[1];
	  fillDormExp();

          if (addrTract[3]) {
	    selectMADTown(selectList);
	    selected = true;
	  }
          else {
            for (var i = 0; i < selectList.length; i++) {
              if (selectList.children[i].value === "D-"+addrTract[2]) {
                selectList.selectedIndex = i;
                result.setAttribute('style','display:inline-block;color:#00c000;');
                result.textContent = '[MATCH: '+matchAddr+']';
                selected = true;
                break;
              }
            }
	  }
	}
        if (!selected) {
	  selectXMAD(selectList);
	  result.setAttribute('style','display:inline-block');
	  result.textContent = '[FAILED: please enter zipcode and census tract manually.]';
	}
      });
    }
  }
}
