// Authored for the EffectCraft engine / iboshka24/effectcraft-mcp workflow.
// Transparent paper / ink / amber composition, not the legacy neon study.
var comp = app.project.items.addComp('EditorialAchievement', 320, 240, 1, 2.4, 30);
function run(id, p) { return app.run(id, p); }
function set(n, p, v) { run('prop.set', {layer:n, path:p, value:v}); }
function key(n, p, t, v) {
  run('prop.addKey', {layer:n, path:p, time:t, value:v});
  run('keys.select', {keys:[{layer:n, prop:p, time:t}]});
  run('keys.easyEase', {which:'both'});
}
function rect(n, x, y, w, h, color, round) {
  var l = comp.layers.addShape(); l.name = n;
  run('layer.addShapeItem', {layer:n, kind:'rect', name:'Paper'});
  run('layer.addShapeItem', {layer:n, kind:'fill', name:'Ink'});
  set(n,'contents/rect/size',[w,h]); set(n,'contents/rect/roundness',round || 0);
  set(n,'contents/fill/color',color); set(n,'transform/position',[x,y]);
  return n;
}
function arrive(n, x, y, delay, angle) {
  key(n,'transform/position',delay,[x,y+26]);
  key(n,'transform/position',delay+.6,[x,y]);
  key(n,'transform/opacity',delay,0); key(n,'transform/opacity',delay+.35,100);
  key(n,'transform/rotation',delay,(angle || 0)-8);
  key(n,'transform/rotation',delay+.7,angle || 0);
}
rect('Back',151,115,116,144,'#E5DAC5',8); arrive('Back',151,115,.02,-9);
rect('Edge',167,118,116,144,'#D5C6A8',8); arrive('Edge',167,118,.09,7);
rect('Page',160,116,116,144,'#FFFDF8',8); arrive('Page',160,116,.16,0);
rect('Bookmark',193,61,10,34,'#B78A4B',2); arrive('Bookmark',193,61,.25,0);
rect('Heading',143,90,48,5,'#986C34',2); arrive('Heading',143,90,.34,0);
rect('Line1',155,109,72,3,'#C0B9A9',1); arrive('Line1',155,109,.39,0);
rect('Line2',151,121,64,3,'#C0B9A9',1); arrive('Line2',151,121,.43,0);
rect('Line3',145,133,52,3,'#C0B9A9',1); arrive('Line3',145,133,.47,0);
var seal = comp.layers.addShape(); seal.name = 'Seal';
run('layer.addShapeItem',{layer:'Seal',kind:'ellipse',name:'Circle'});
run('layer.addShapeItem',{layer:'Seal',kind:'fill',name:'Olive'});
set('Seal','contents/ellipse/size',[56,56]);set('Seal','contents/fill/color','#42745B');
set('Seal','transform/position',[204,164]);
key('Seal','transform/scale',.68,[0,0]);key('Seal','transform/scale',1.12,[110,110]);key('Seal','transform/scale',1.38,[100,100]);
rect('CheckShort',196,165,6,16,'#FFFDF8',2);set('CheckShort','transform/rotation',-42);
rect('CheckLong',210,161,6,28,'#FFFDF8',2);set('CheckLong','transform/rotation',42);
['CheckShort','CheckLong'].forEach(function(n) {
  key(n,'transform/opacity',.97,0);key(n,'transform/opacity',1.16,100);
  key(n,'transform/scale',.97,[65,65]);key(n,'transform/scale',1.28,[100,100]);
});
// Small restrained punctuation: four amber dashes, then settle completely.
for(var i=0;i<4;i++) {
  var x = [83,242,93,248][i], y = [84,87,162,139][i];
  var n = rect('Accent'+i,x,y,4,12,'#B78A4B',2);
  set(n,'transform/rotation',i*48-26);
  key(n,'transform/opacity',.75+i*.04,0);key(n,'transform/opacity',1.02+i*.04,100);
  key(n,'transform/opacity',1.5+i*.04,0);
  key(n,'transform/position',.75,[160,116]);key(n,'transform/position',1.45,[x,y]);
}
writeLn('EditorialAchievement ready: 320x240, transparent, 2.4s, 15 shape layers.');
