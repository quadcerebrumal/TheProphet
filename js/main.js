let followers_per_click;
let money_per_follower;
let money_per_second;
let followers_per_second;
let recruiting;
let followers;
let money;
let buildings;
let upgrades;

class Wallet {
  constructor() {
    this.amount = 0;
    this.total = 0;
  }

  add(amount) {
    this.amount += amount;
    this.total += amount;
  }

  remove(amount) {
    this.amount -= amount;
  }
}

class Upgrade {
  constructor(id, name, description, price, effect, shown) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.effect = effect;
    this.owned = false;
    this.shown = shown;
  }
  buy() {
    if(money.amount >= this.price) {
      money.remove(this.price);
      this.owned = true;
      this.effect();
      $("#"+this.id+"-price-display span").text("PURCHASED");
      $("#"+this.id+"-price-display").removeClass('affordable').removeClass('expensive').addClass('purchased').removeAttr('onclick');
    } else {
      M.toast({html: "You need more money for this action."});
    }
  }
}


class Building {
  constructor(id, name, description, price, effect, init, price_inc) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.price_inc = price_inc || 1.1;
    this.effect = effect;
    this.init = init;
    this.count = 0;
    this.unlocked = false;
  }

  execute() {
    this.effect();
  }

  unlock() {
    this.unlocked = true;
  }

  buy() {
    if (money.amount >= this.price) {
      money.remove(this.price);
      this.price = this.price * this.price_inc;
      this.count++;
    } else {
      M.toast({html: "You need more money for this action."});
    }
  }
}


function update_display() {
  $("#follower-stat").text(followers.amount.toFixed(0));
  $("#money-stat").text(money.amount.toFixed(2));
  $("#mps-stat").text(money_per_second.toFixed(2));
  $("#fps-stat").text(followers_per_second.toFixed(2));
  money_per_second = 0;
  followers_per_second = 0;
  for(let building in buildings) {
    $("#" + buildings[building].id + "-price").text(buildings[building].price.toFixed(2));
    $("#" + buildings[building].id + "-amount").text(buildings[building].count);
    if (buildings[building].unlocked) {
      $("#"+buildings[building].id + "-building").show();
      if (buildings[building].price <= money.amount) {
        $("#"+buildings[building].id + "-price-display").removeClass('expensive').addClass('affordable');
      } else {
        $("#"+buildings[building].id + "-price-display").removeClass('affordable').addClass('expensive');
      }
    } else {
      $("#"+buildings[building].id + "-building").hide();
    }
  }
  for(let upgrade in upgrades) {
    if(upgrades[upgrade].owned === false) {
      if (upgrades[upgrade].shown()) {
        $("#" + upgrades[upgrade].id + "-upgrade").show();
        if (upgrades[upgrade].price <= money.amount) {
          $("#" + upgrades[upgrade].id + "-price-display").removeClass("expensive").addClass("affordable");
        } else {
          $("#" + upgrades[upgrade].id + "-price-display").removeClass("affordable").addClass("expensive");
        }
      } else {
        $("#" + upgrades[upgrade].id + "-upgrade").hide();
      }
    }
  }
}

function tick() {
  money.add(followers.amount * money_per_follower * 0.1);
  for (let building in buildings) {
    buildings[building].execute();
  }
  money_per_second += followers.amount * money_per_follower;
}

function save() {
  let buildings_save = {};
  let upgrades_save = {};
  for(let building in buildings) {
    buildings_save[buildings[building].id] = {
      'count': buildings[building].count,
      'price': buildings[building].price,
      'unlocked': buildings[building].unlocked
    }
  }
  for(let upgrade in upgrades) {
    upgrades_save[upgrades[upgrade].id] = {
      'owned': upgrades[upgrade].owned
    }
  }
  let save = JSON.stringify({
    'followers': followers.amount,
    'followers_total': followers.total,
    'money': money.amount,
    'money_total': money.total,
    'buildings': buildings_save,
    'upgrades': upgrades_save,
    'money_per_follower': money_per_follower,
    'followers_per_click': followers_per_click,
    'recruiting': recruiting,
  });
  window.localStorage.setItem('save', save);
}

function reset() {
  // Set variables
  followers_per_click = 1;
  money_per_follower = 0.01;
  money_per_second = 0;
  followers_per_second = 0;
  recruiting = 1;
  money = new Wallet();
  followers = new Wallet();

  // Set buildings
  buildings = [
    new Building("meeting-place", "Meeting place", "Recruits <span id='meeting-place-desc'>1</span> <img src='img/icons/teamwork.svg' alt='follower(s)'> in 10 seconds<br>Producing: <span id='meeting-place-production'>0</span> <img src='img/icons/teamwork.svg' alt='follower(s)'> / second", 2, function() {
      followers.add(this.count * 0.01 * recruiting);
      followers_per_second += this.count * 0.1 * recruiting;
      $("#meeting-place-desc").text(recruiting.toFixed(0));
      $("#meeting-place-production").text((this.count * 0.1 * recruiting).toFixed(2));
    }, function() {  }, 1.2),
    new Building("church", "Church", "Recruits <span id='church-desc'>1</span> <img src='img/icons/teamwork.svg' alt='follower(s)'> / second<br>Producing: <span id='church-production'>0</span> <img src='img/icons/teamwork.svg' alt='follower(s)'> / second", 100, function() {
      followers.add(this.count * 0.1 * recruiting);
      followers_per_second += this.count * 1 * recruiting;
      $("#church-desc").text(recruiting.toFixed(0));
      $("#church-production").text((this.count * 1 * recruiting).toFixed());
    }, function() {  }, 1.2),
    new Building("sacrificial-place", "Sacrificial Place", "Produces $ <span id='building-sacrificial-place-production'>0.01</span> per <img src='img/icons/teamwork.svg' alt='follower'> / second<br>Producing: $ <span id='sacrificial-place-production'>0</span> / second", 500, function() {
      money.add(money_per_follower * followers.amount / 10 * this.count);
      money_per_second += money_per_follower * followers.amount * this.count;
      $("#building-sacrificial-place-production").text(money_per_follower.toFixed(2));
      $("#sacrificial-place-production").text((money_per_follower * followers.amount * this.count).toFixed(2));
    }, function() {  }, 1.2)
  ];
  // Set upgrades
  upgrades = [
    new Upgrade("unlock-meeting-place", "Unlock Meeting Place", "Unlocks the meeting place", 2, function () {
      for(let building in buildings) {
        if(buildings[building].id === "meeting-place") {
          buildings[building].unlock();
          break;
        }
      }
    }, () => {return followers.total > 10}),
    new Upgrade("double-fee-0", "Higher fee", "Doubles your <img src='img/icons/teamwork.svg' alt='follower(s)'>-fee", 50, function () {
      money_per_follower += money_per_follower;
    }, () => {return money.total > 200}),
    new Upgrade("unlock-church", "Unlock Church", "Unlocks the Church", 100, function () {
      for(let building in buildings) {
        if(buildings[building].id === "church") {
          buildings[building].unlock();
          break;
        }
      }
    }, () => {return buildings[0].count > 4}),
    new Upgrade("unlock-sacrificial-place", "Unlock Sacrificial Place", "Unlocks the Sacrificial Place", 500, function() {
      for(let building in buildings) {
        if(buildings[building].id === "sacrificial-place") {
          buildings[building].unlock();
          break;
        }
      }
    }, () => {return buildings[1].count > 4}),
    new Upgrade("ancient-relic", "Ancient relic", "Increases <img src='img/icons/teamwork.svg' alt='follower(s)'> growth-rate by 50%", 500, function () {
      recruiting += recruiting / 2;
    }, () => {return followers.total > 100 && buildings[1].unlocked}),
    new Upgrade("ceremonies", "Ceremonies", "Increases <img src='img/icons/teamwork.svg' alt='follower(s)'> growth-rate by 50%", 1500, function () {
      recruiting += recruiting / 2;
    }, () => {return money.total > 10000}),
    new Upgrade("sacred-texts", "Sacred Texts", "Increases <img src='img/icons/teamwork.svg' alt='follower(s)'> growth-rate by 50%", 3000, function () {
      recruiting += recruiting / 2;
    }, () => {return followers.total > 1000 }),
    new Upgrade("tax-exempt", "Tax-Exempt", "Removes the 30% taxes from your in-flow", 100, function () {
      money_per_follower = money_per_follower * 1.4285714;
    }, () => {return followers.total > 10000}),
    new Upgrade("central-control", "Secret central control", "Better indoctrination (20% higher <img src='img/icons/teamwork.svg' alt='follower(s)'> growth) and triples fee through blackmail.", 5000000000, function () {
      recruiting = recruiting * 1.2;
      money_per_follower = money_per_follower * 3
    }, () => {return upgrades[7].owned})
  ];

  // Put the buildings into the buildings tab
  document.getElementById("buildings-card").innerHTML = '';
  for(let building in buildings) {
    document.getElementById("buildings-card").innerHTML += "" +
      "<div id='" + buildings[building].id + "-building' class='block-container center-align'>" +
      "<div class='block-title'>" +
      "<span>" + buildings[building].name + "<img class='icon right' src='img/icons/house.svg' alt></span>" +
      "</div>" +
      "<div class='block-content'>" +
      "<span>" + buildings[building].description + "</span><br>" +
      "<span>You have: <span id='" + buildings[building].id + "-amount'></span></span>" +
      "<div onclick='buildings["+building+"].buy()' id='" + buildings[building].id + "-price-display' class='price'>" +
      "<span>$ <span id='" + buildings[building].id + "-price'>" + buildings[building].price + "</span></span>" +
      "</div>" +
      "</div>" +
      "</div>";

    buildings[building].init();
  }

  // Put the upgrades into the upgrades tab
  document.getElementById("upgrades-card").innerHTML = '';
  for(let upgrade in upgrades) {
    document.getElementById("upgrades-card").innerHTML = "" +
      "<div id='" + upgrades[upgrade].id + "-upgrade' class='block-container center-align'>" +
      "<div class='block-title'>" +
      "<span>" + upgrades[upgrade].name + "<img class='icon right' src='img/icons/surface1.svg' alt></span>" +
      "</div>" +
      "<div class='block-content'>" +
      "<span>" + upgrades[upgrade].description + "</span><br><br>" +
      "<div onclick='upgrades["+upgrade+"].buy()' id='" + upgrades[upgrade].id + "-price-display' class='price'>" +
      "<span>$ " + upgrades[upgrade].price + "</span>" +
      "</div>" +
      "</div>" +
      "</div>"
      + document.getElementById("upgrades-card").innerHTML;
  }
}


function init() {
  // Update information
  $.ajax({
    'async': true,
    'global': false,
    'url': "notice.json",
    'dataType': "json",
    'success': function (data) {
      console.log("Running version " + data['version']['string'] + " ( " + data['version']['float'].toString() + " )");
      $("#version-notice").text(data['version']['string']);
    }
  });

  // Add plugin to sidebar
  document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems, {});
  });

  // Set variables
  reset();

  // Make the recruit button recruit
  document.getElementById("recruit-btn").onclick = function () {
    followers.add(followers_per_click * recruiting);
  };
  // Make the reset button reset
  document.getElementById("reset-btn").onclick = function () {
    reset();
    M.toast({html: "Your game was reset."});
  };


  // Read localStorage save if possible
  if(window.localStorage.getItem("save") !== null) {
    let save = JSON.parse(window.localStorage.getItem("save"));
    followers.amount = save['followers'];
    followers.total = save['followers_total'];
    money.amount = save['money'];
    money.total = save['money_total'];
    for (let save_building in save['buildings']) {
      for (let building in buildings) {
        if (buildings[building].id === save_building) {
          buildings[building].count = save['buildings'][save_building]['count'];
          buildings[building].price = save['buildings'][save_building]['price'];
          buildings[building].unlocked = save['buildings'][save_building]['unlocked'];
          if (buildings[building].unlocked) {
            buildings[building].unlock();
          }
        }
      }
    }
    for (let save_upgrade in save['upgrades']) {
      for (let upgrade in upgrades) {
        if (upgrades[upgrade].id === save_upgrade) {
          upgrades[upgrade].owned = save['upgrades'][save_upgrade]['owned'];
          if (upgrades[upgrade].owned) {
            $("#"+upgrades[upgrade].id+"-price-display span").text("PURCHASED");
            $("#"+upgrades[upgrade].id+"-price-display").removeClass('affordable').removeClass('expensive').addClass('purchased').removeAttr('onclick');
          }
        }
      }
    }
    money_per_follower = save['money_per_follower'];
    followers_per_click = save['followers_per_click'];
    recruiting = save['recruiting'];
  }
  window.updateDisplayIntervalID = window.setInterval(update_display, 100);
  window.tickIntervalID = window.setInterval(tick, 100);
  window.saveIntervalID = window.setInterval(save, 5000);
}

init();
