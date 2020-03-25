let vm = new Vue({
    el: "#app",
    data: {

    },
    methods: {
        tick: function () {

        }
    },
    created: function () {
        this.loopID = setInterval(this.tick, 100)
    }
});