(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*** CHECK AGAINST LIST OF UNACCEPTABLE
       AND RESTRICTED ADDRESSES ***/

  /* Define address object */
  var Address = function (addrRegEx, addr, place) {
    // addrRegEx formatted to be inserted at a regex literal
    this.addrRegEx = addrRegEx;
    // The place/organization of the restricted address
    this.place = place;
    // The type of restricted address {unacceptable,restricted}
    this.addr = addr;
  },
    addr,
    city;

  function restoreSave() {
    var field = document.getElementsByClassName('action')[0];
    if (field !== null && field.childElementCount === 3) {
      field.replaceChild(field.children[2], field.children[0]);
      field.children[0].style = "cursor:pointer;";
    } else {
      alert("Unable to save. Please refresh the page.");
    }
    return false;
  }

  function blockSubmit() {
    var field = document.getElementsByClassName('action')[0],
      button;
    if (field !== null) {
      button = document.createElement('input');
      button.type = 'button';
      button.value = 'Override Block';
      button.style = 'cursor:pointer;';
      button.addEventListener('click', restoreSave);
      field.appendChild(button);
      field.appendChild(field.children[1]);
      field.appendChild(field.children[0]);
      field.children[2].style = "display:none;";
    }
    return false;
  }

  function curDate() {
    var date = new Date(),
      year = date.getFullYear(),
      month = (1 + date.getMonth()).toString(),
      day;
    month = month.length > 1 ? month : '0' + month;
    day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
  }

  function parseBadAddr() {
    var addr = document.getElementById('address'),
      addr2 = document.getElementById('address2'),
      city = document.getElementById('city'),
      bn = document.getElementById('borrowernotes'),
      cityRegEx = /mad(ison([,]? wi.*)?)?|monona([,]? wi.*)?/i,
      unacceptable = [
        new Address("1819 aberg", "1819 Aberg Ave", "State Job Placement Center"),
        new Address("1955 atwood", "1955 Atwood Ave", "Briarpatch"),
        new Address("4581 w(est)? beltline", "4581 W Beltline Hwy", "PO Boxes/Mail Services"),
        new Address("147 s(outh)? butler", "147 S Butler St", "Veteran's house"),
        new Address("115 w(est)? doty", "115 W Doty St", "Dane County Jail"),
        new Address("4230 e(ast)? towne", "4230 E Towne Blvd", "PO Boxes/Mail Services"),
        new Address("6441 enterprise", "6441 Enterprise Ln", "PO Boxes/Mail Services"),
        new Address("2935 fish hatchery", "2935 Fish Hatchery Rd", "PO Boxes/Mail Services"),
        new Address("802 e(ast)? gorham", "802 E Gorham St", "Yahara House"),
        new Address("408 w(est)? gorham", "408 W Gorham St", "Social Club"),
        new Address("310 s(outh)? ingersoll st", "310 S Ingersoll St", "Luke House"),
        new Address("210 martin luther king jr", "210 Matrin Luther King Jr Blvd", "Dane County Jail"),
        new Address("3902 milwaukee", "3902 Milwaukee St", "Main Post Office"),
        new Address("4514 monona dr", "4514 Monona Dr", "PO Boxes/Mail Services"),
        new Address("1202 northport", "1202 Northport Dr", "Dane County Social Services"),
        new Address("1206 northport", "1206 Northport Dr", "Dane County Social Services"),
        new Address("6666 odana", "6666 Odana Rd", "PO Boxes/Mail Services"),
        new Address("128 e(ast)? olin", "128 E Olin Ave", "Family Service Madison"),
        new Address("1228 s(outh)? park", "1228 S Park St", "Dane County Housing Authority"),
        new Address("1240 s(outh)? park", "1240 S Park St", "Housing Service"),
        new Address("1360 regent", "1360 Regent St", "PO Boxes/Mail Services"),
        new Address("2120 rimrock", "2120 Rimrock Rd", "Dane County Jail"),
        new Address("3150 st paul", "3150 St Paul Ave", "DoC Housing - 2 Week Stay"),
        new Address("103 s(outh)? (second|2nd)", "103 S Second", "Mail Service"),
        new Address("1213 n(orth)? sherman", "1213 N Sherman Ave", "PO Boxes/Mail Services"),
        new Address("731 state", "731 State St", "Pres House"),
        new Address("2701 university", "2701 University Ave", "PO Boxes/Mail Services"),
        new Address("322 e(ast)? washington", "322 E Washington Ave", "St John's Lutheran Church"),
        new Address("512 e(ast)? washington", "512 E Washington Ave", "Probation/Parole"),
        new Address("1245 e(ast)? washinton", "1245 E Washington Ave", "Advocacy Offices"),
        new Address("116 w(est)? washington", "116 W Washington Ave", "Grace Episcopal Church"),
        new Address("625 w(est)? washington", "625 W Washington Ave", "Meriter Health Center"),
        new Address("668 w(est)? washington", "668 W Washington Ave", "Mail Service")
      ],
      restricted = [
        new Address("221 s(outh)? baldwin", "221 S Baldwin St", "Port St Vincent"),
        new Address("2009 e(ast)? dayton", "2009 E Dayton St", "ARC Dayton"),
        new Address("4117 dwight", "4117 Dwight Dr", "Dwight Halfway House"),
        new Address("300 femrite", "300 Femrite Dr", "Telurian"),
        new Address("4 n(orth)? hancock", "4 N Hancock St", "Off Square Club"),
        new Address("3501 kipling", "3501 Kipling Dr", "Schwert Halfway House"),
        new Address("4202 monona", "4202 Monona Dr", "ARC Maternal Infant Program"),
        new Address("4006 Nakoosa", "4006 Nakoosa Trl", "Porchlight/Safe Haven"),
        new Address("422 n(orth)?", "422 North St", "Arise Family Services"),
        new Address("5706 odana", "5706 Odana Rd", "Foster Halfway House"),
        new Address("810 w(est)? olin", "810 W Olin Ave", "Rebos Chris Farley House"),
        new Address("202 n(orth)? patt?erson", "202 N Paterson St", "ARC Patterson"),
        new Address("2720 rimrock", "2720 Rimrock Rd", "Youth Services of Southern Wisconsin"),
        new Address("312 wisconsin", "312 Wisconsin Ave", "Bethel Lutheran Church"),
        new Address("1301 williamson", "1301 Williamson St", "Port St Vincent")
      ],
      addrRegExFirst = /^[ ]*/,
      addrRegExLast = /.*/,
      fullAddrRegEx = new RegExp(),
      foundBadAddr = false,
      addrVal,
      i,
      field;
    if (addr !== null && city !== null && cityRegEx.test(city.value) && bn !== null) {
      addrVal = addr2 !== null && (addr2.value !== null && addr2.value !== "") ? addr.value + " " + addr2.value : addr.value;
      if (/1490 martin/i.test(addrVal)) {
        foundBadAddr = true;
        alert("--- NOTE ---\n1490 MARTIN ST is the Hospitality House, a daytime resource center for homeless and low-income people in Dane County. A LIMITED USE account may be set up, however, all library cards issued to that address MUST be mailed, whether or not the patron provides proof of that address.\n\nIn order to have the Limited Use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf");
        if (!/.*Patron must show proof of valid residential address in order to remove restrictions.*/.test(bn.value)) {
          if (bn.value !== '') {
            bn.value += "\n\n";
          }
          bn.value += "Patron's account is Limited Use due to address (Hospitality House, " + addrVal + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " ";
        }
      } else if (/630 e(ast)? washington/i.test(addrVal)) {
        foundBadAddr = true;
        alert("--- NOTE ---\n630 E WASHINGTON AVE is the Salvation Army. People staying at the Salvation Army cannot receive personal mail there so library cards CANNOT BE MAILED. Patrons must have proof that they are staying at the Salvation Army to get a library card (usually through a letter from the director).\n\nIn order to have the Limited Use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf");
        if (!/.*Patron must show proof of valid residential address in order to remove restrictions.*/.test(bn.value)) {
          if (bn.value !== '') {
            bn.value += "\n\n";
          }
          bn.value += "Patron's account is Limited Use due to address (Salvation Army, " + addrVal + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " ";
        }
      }
      // Test for unacceptable addresses
      for (i = 0; i < unacceptable.length; i++) {
        if (foundBadAddr) {
          break;
        }
        fullAddrRegEx = new RegExp(addrRegExFirst.source + unacceptable[i].addrRegEx + addrRegExLast.source, "i");
        if (fullAddrRegEx.test(addrVal)) {
          alert("--- STOP ---\nA library card CANNOT be issued to this address.\n" + unacceptable[i].addr + " (" + unacceptable[i].place + ") is NOT a valid residential address.\n\nInform any patron providing this address that they must provide proof of a valid residential address in order to get a library card. (You could offer them an internet access card.)\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf");
          field = document.getElementsByClassName('action')[0];
          if (field !== null && field.children[0].value !== 'Override Block') {
            blockSubmit();
          }
	        foundBadAddr = true;
        }
      }
      // Test for restricted addresses
      for (i = 0; i < restricted.length; i++) {
        if (foundBadAddr) {
          break;
        }
        fullAddrRegEx = new RegExp(addrRegExFirst.source + restricted[i].addrRegEx + addrRegExLast.source, "i");
        if (fullAddrRegEx.test(addrVal)) {
          alert("--- NOTE ---\nA library card issued to " + restricted[i].addr + " (" + restricted[i].place + ") must be LIMITED USE.\n\nIn order to have the limited use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf");
          if (!/.*Patron must show proof of valid residential address in order to remove restrictions.*/.test(bn.value)) {
            if (bn.value !== '') {
              bn.value += "\n\n";
            }
            bn.value += "Patron's account is Limited Use due to temporary residence at " + restricted[i].place + ", (" + restricted[i].addr + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " ";
          }
	        foundBadAddr = true;
        }
      }
      if (!foundBadAddr) {
        field = document.getElementsByClassName('action')[0];
        if (field !== null && field.children[0].value === 'Override Block') {
          restoreSave();
        }
      }
    }
  }

  addr = document.getElementById('address');
  if (addr !== null) {
    addr.addEventListener('blur', parseBadAddr);
  }
  city = document.getElementById('city');
  if (city !== null) {
    city.addEventListener('blur', parseBadAddr);
  }
  }()); //end use strict