let followers = 0;
let money = 0;
let followers_per_click = 1;
let money_per_follower = 0.01;
let recruiting = 1;


class Upgrade {
  constructor(id, name, description, price, effect) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.effect = effect;
    this.owned = false;
  }
  buy() {
    if(money >= this.price) {
      money -= this.price;
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
  }

  execute() {
    this.effect();
  }

  buy() {
    if (money >= this.price) {
      money -= this.price;
      this.price = this.price * this.price_inc;
      this.count++;
    } else {
      M.toast({html: "You need more money for this action."});
    }
  }
}


let buildings = [
  new Building("meeting-place", "Meeting place", "Recruits 1 follower in 10 seconds", 2, function() {
    followers += this.count * 0.01 * recruiting;
  }, function() { $("#building-meeting-place").hide(); }, 1.1),
  new Building("church", "Church", "Recruits 1 follower per second", 100, function() {
    followers += this.count * 0.1 * recruiting;
  }, function() { $("#building-church").hide(); }, 1.4),
  new Building("sacrificial-place", "Sacrificial Place", "Produces $ 0.01 per follower per second", 500, function() {
    money += money_per_follower * followers / 10;
  }, function() { $("#building-sacrificial-place").hide(); }, 1.2),
];


let upgrades = [
  new Upgrade("unlock-meeting-place", "Unlock Meeting Place", "Unlocks the meeting place", 2, function () {
    $("#building-meeting-place").show();
  }),
  new Upgrade("double-fee-0", "Higher fee", "Increases your followers' fee by 100%", 50, function () {
    money_per_follower += money_per_follower;
  }),
  new Upgrade("unlock-church", "Unlock Church", "Unlocks the Church", 100, function () {
    $("#building-church").show();
  }),
  new Upgrade("unlock-sacrificial-place", "Unlock Sacrificial Place", "Unlocks the Sacrificial Place", 500, function() {
    $("#building-sacrificial-place").show();
  }),
  new Upgrade("ancient-relic", "Ancient relic", "Increases recruiting by 50%", 500, function () {
    recruiting += recruiting / 2;
  }),
  new Upgrade("ceremonies", "Ceremonies", "Increases recruiting by 50%", 1500, function () {
    recruiting += recruiting / 2;
  }),
  new Upgrade("sacred-texts", "Sacred Texts", "Increases recruiting by 50%", 3000, function () {
    recruiting += recruiting / 2;
  }),
];


function update_display() {
  $("#follower-stat").text(followers.toFixed(0));
  $("#money-stat").text(money.toFixed(2));
  for(let building in buildings) {
    $("#building-" + buildings[building].id + "-price").text(buildings[building].price.toFixed(2));
    $("#building-" + buildings[building].id + "-amount").text(buildings[building].count);
  }
  for(let upgrade in upgrades) {
    if(!upgrades[upgrade].owned) {
      if(upgrades[upgrade].price <= money) {
        $("#upgrade-"+upgrades[upgrade].id).removeClass("red").addClass("teal");
      } else {
        $("#upgrade-"+upgrades[upgrade].id).removeClass("teal").addClass("red");
      }
    }
  }
}

function tick() {
  money += followers * money_per_follower * 0.1;
  for (let building in buildings) {
    buildings[building].execute();
  }
}

function init() {
  // Make the recruit button recruit
  document.getElementById("recruit-btn").addEventListener("click", function () {
    followers += followers_per_click;
  });
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
    document.getElementById("upgrades-card").innerHTML += "" +
      "<div style='padding-bottom: 10px' class='card col s12 red' id='upgrade-"+upgrades[upgrade].id+"'><h6>" + upgrades[upgrade].name + "</h6><span>" +
      upgrades[upgrade].description + "<span id='upgrade-" + upgrades[upgrade].id + "-price'><br>Price: $ " + upgrades[upgrade].price + "</span></span><br>" +
      "<button id='upgrade-" + upgrades[upgrade].id + "-btn' onclick='upgrades[" + upgrade + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>";
  }
  const intervalID = window.setInterval(() => {
    tick();
    update_display();
  }, 100);
}

init();
