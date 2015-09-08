if (process.platform === 'darwin') {
  Mousetrap.bindGlobal("command+a", function() {
    document.execCommand("selectAll");
  });

  Mousetrap.bindGlobal("command+x", function() {
    document.execCommand("cut");
  });

  Mousetrap.bindGlobal("command+c", function() {
    document.execCommand("copy");
  });

  Mousetrap.bindGlobal("command+v", function() {
    document.execCommand("paste");
  });
}