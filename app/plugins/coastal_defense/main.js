define([
        "dojo/_base/declare",
        "framework/PluginBase"
       ],
       function (declare, PluginBase) {
           return declare(PluginBase, {
               toolbarName: "Coastal Defense",
               toolbarType: "sidebar",
               allowIdentifyWhenActive: true,
               activate: function () { },
               deactivate: function () { },
               hibernate: function () { },
               initialize: function () { },
               getState: function () { },
               setState: function () { },
           });
       });
