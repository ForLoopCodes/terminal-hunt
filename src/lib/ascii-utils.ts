// Utility function to format ASCII art with capitals below
export function formatAsciiArt(text: string, title: string): string {
  // Use Terminal Hunt ASCII art if no custom art is provided
  const asciiToUse = text.trim() || TERMHUNT_ASCII;

  // Add the ASCII art
  const asciiLines = asciiToUse.split("\n");

  // Create capital letters with proper spacing
  const capitalTitle = title.toUpperCase().split("").join("   ");

  // Combine ASCII art with title
  return asciiLines.join("\n") + "\n\n" + capitalTitle;
}

// Terminal Hunt ASCII art
export const TERMHUNT_ASCII = `
 ___                                   ___                      ___      
(   )                                 (   )                    (   )     
 | |_     .--.  ___ .-.  ___ .-. .-.   | | .-. ___  ___ ___ .-. | |_     
(   __)  /    \\(   )   \\(   )   '   \\  | |/   (   )(   |   )   (   __)   
 | |    |  .-. ;| ' .-. ;|  .-.  .-. ; |  .-. .| |  | | |  .-. .| |      
 | | ___|  | | ||  / (___) |  | |  | | | |  | || |  | | | |  | || | ___  
 | |(   )  |/  || |      | |  | |  | | | |  | || |  | | | |  | || |(   ) 
 | | | ||  ' _.'| |      | |  | |  | | | |  | || |  | | | |  | || | | |  
 | ' | ||  .'.-.| |      | |  | |  | | | |  | || |  ; ' | |  | || ' | |  
 ' \`-' ;'  \`-' /| |      | |  | |  | | | |  | |' \`-'  / | |  | |' \`-' ;  
  \`.__.  \`.__.'(___)    (___)(___)(___|___)(___)'.__.' (___)(___)\`.__.   
`;

export const TERMHUNT_TITLE = "TERMINAL   HUNT";
