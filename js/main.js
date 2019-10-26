let followers_per_click;
let money_per_follower;
let recruiting;
let money;
let followers;
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
      $("#upgrade-"+this.id+"-btn").remove();
      $("#upgrade-"+this.id+"-price").remove();
      $("#upgrade-"+this.id).removeClass("teal").addClass("green accent-4");
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
  for(let building in buildings) {
    $("#building-" + buildings[building].id + "-price").text(buildings[building].price.toFixed(2));
    $("#building-" + buildings[building].id + "-amount").text(buildings[building].count);
    if (buildings[building].unlocked) {
      $("#building-"+buildings[building].id).show();
    } else {
      $("#building-"+buildings[building].id).hide();
    }
  }
  for(let upgrade in upgrades) {
    if(upgrades[upgrade].owned === false) {
      if (upgrades[upgrade].shown()) {
        $("#upgrade-" + upgrades[upgrade].id).show();
        if (upgrades[upgrade].price <= money.amount) {
          $("#upgrade-" + upgrades[upgrade].id).removeClass("red").addClass("teal");
        } else {
          $("#upgrade-" + upgrades[upgrade].id).removeClass("teal").addClass("red");
        }
      } else {
        $("#upgrade-" + upgrades[upgrade].id).hide();
      }
    }
  }
}

function tick() {
  money.add(followers.amount * money_per_follower * 0.1);
  for (let building in buildings) {
    buildings[building].execute();
  }
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
  recruiting = 1;
  money = new Wallet();
  followers = new Wallet();

  // Set buildings
  buildings = [
    new Building("meeting-place", "Meeting place", "Recruits 1 follower in 10 seconds", 2, function() {
      followers.add(this.count * 0.01 * recruiting);
    }, function() {  }, 1.2),
    new Building("church", "Church", "Recruits 1 follower per second", 100, function() {
      followers.add(this.count * 0.1 * recruiting);
    }, function() {  }, 1.2),
    new Building("sacrificial-place", "Sacrificial Place", "Produces $ <span id='building-sacrificial-place-production'>0.01</span> per follower per second", 500, function() {
      money.add(money_per_follower * followers.amount / 10 * this.count);
      $("#building-sacrificial-place-production").text(money_per_follower.toFixed(2));
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
    new Upgrade("double-fee-0", "Higher fee", "Increases your followers' fee by 100%", 50, function () {
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
    new Upgrade("ancient-relic", "Ancient relic", "Increases recruiting by 50%", 500, function () {
      recruiting += recruiting / 2;
    }, () => {return followers.total > 100 && buildings[1].unlocked}),
    new Upgrade("ceremonies", "Ceremonies", "Increases recruiting by 50%", 1500, function () {
      recruiting += recruiting / 2;
    }, () => {return money.total > 10000}),
    new Upgrade("sacred-texts", "Sacred Texts", "Increases recruiting by 50%", 3000, function () {
      recruiting += recruiting / 2;
    }, () => {return followers.total > 1000 }),
    new Upgrade("tax-exempt", "Tax-Exempt", "Removes the 30% taxes from your in-flow", 100, function () {
      money_per_follower = money_per_follower * 1.4285714;
    }, () => {return followers.total > 10000}),
    new Upgrade("central-control", "Secret central control", "Decreases followers leaving and increases fee by 200% the cult through blackmail.", 500000, function () {
      recruiting = recruiting * 1.5;
      money_per_follower = money_per_follower * 3
    }, () => {return followers.total > 100000})
  ];

  // Put the buildings into the buildings tab
  document.getElementById("buildings-card").innerHTML = '';
  for(let building in buildings) {
    document.getElementById("buildings-card").innerHTML += "" +
      "<div id='building-" + buildings[building].id + "' style='padding-bottom: 10px' class='card col s12'><h6>" + buildings[building].name + "</h6><span>" +
      buildings[building].description + "<br/>Price: $ <span id='building-" + buildings[building].id + "-price'>" + buildings[building].price.toFixed(2) + "</span><br/>Amount: <span id='building-"+buildings[building].id+"-amount'>0</span></span><br>" +
      "<button onclick='buildings[" + building + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>";
    buildings[building].init();
  }

  // Put the upgrades into the upgrades tab
  document.getElementById("upgrades-card").innerHTML = '';
  for(let upgrade in upgrades) {
    document.getElementById("upgrades-card").innerHTML = "" +
      "<div style='padding-bottom: 10px' class='card col s12 red' id='upgrade-"+upgrades[upgrade].id+"'><h6>" + upgrades[upgrade].name + "</h6><span>" +
      upgrades[upgrade].description + "<span id='upgrade-" + upgrades[upgrade].id + "-price'><br>Price: $ " + upgrades[upgrade].price + "</span></span><br>" +
      "<button id='upgrade-" + upgrades[upgrade].id + "-btn' onclick='upgrades[" + upgrade + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>" + document.getElementById("upgrades-card").innerHTML;
  }
}


function init() {
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
            $("#upgrade-" + upgrades[upgrade].id + "-btn").remove();
            $("#upgrade-" + upgrades[upgrade].id + "-price").remove();
            $("#upgrade-" + upgrades[upgrade].id).removeClass("teal").addClass("green accent-4");
          }
        }
      }
    }
    window.money_per_follower = save['money_per_follower'];
    window.followers_per_click = save['followers_per_click'];
    window.recruiting = save['recruiting'];
  }
  window.updateDisplayIntervalID = window.setInterval(update_display, 100);
  window.tickIntervalID = window.setInterval(tick, 100);
  window.saveIntervalID = window.setInterval(save, 5000);
}

init();
