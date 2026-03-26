class Decorator {
  static drawLine(num, type) {
    if(type == 1){
      console.log("=".repeat(num));
    }else if(type == 2){
      console.log("-".repeat(num));
    }else if(type == 3){
      console.log("_".repeat(num));
    }else if(type == 4){
      console.log("~".repeat(num));
    }
  }

  // ┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼
  static showFormatNote(note){
      this.drawLine(50);
      console.log(" ┌" + "─".repeat(50));
      console.log(` │ ${note.id} * ${note.date}`);
      console.log(` │ ${note.title}`);
      console.log(` │ ${note.content}`); 
      console.log(" └" + "─".repeat(50));
      this.drawLine(50);
  }

  static showFormatAllNotes(notes){
    console.log("----Все ваши заметки----");
    notes.forEach((note) => {
      note.showFormatNote(note);
    });
  }

  static drawDoubleLine(length = 30) {
    console.log("=".repeat(length));
    console.log("=".repeat(length));
  }

  static presentMenu(welcome) {
    this.drawDoubleLine();
    console.log(`\n   ${welcome}\n`);
    this.drawDoubleLine();
  }

  static noteHeader(note) {
    this.drawLine(50, 2);
    console.log(`   📝 ${note.title}`);
    this.drawLine(50, 2);
  }

  static infoMessage(message, type = 'info') {
    const symbols = {
      success: '✅ ',
      error: '❌ ',
      warning: '⚠️ ',
      info: 'ℹ️ '
    };
    
    const symbol = symbols[type] || symbols.info;
    console.log(`\n${symbol} ${message}\n`);
  }

  static contentBox(content) {
    console.log("┌" + "─".repeat(28) + "┐");
    const lines = content.split('\n');
    lines.forEach(line => {
      const paddedLine = line.padEnd(28);
      console.log(`│ ${paddedLine} │`);
    });
    console.log("└" + "─".repeat(28) + "┘");
  }

  static showMenu(items) {
    console.log('\n');
    this.drawLine(50, 2);
    console.log('   ГЛАВНОЕ МЕНЮ');
    this.drawLine(50, 2);
    
  }
}

module.exports = Decorator;