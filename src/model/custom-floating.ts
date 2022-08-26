import { workspace, FloatFactory } from "coc.nvim"

interface Color {
  fg: string
  bg: string
}

async function generateColor(symbol: string): Promise<Color> {
  const res = { bg: "NONE", fg: "NONE" }
  const color = await workspace.nvim.exec(`hi ${symbol}`, true)
  if (!color) {
    return null
  }
  const bg = color.match(/(?<=(guibg=)).*?(?=(\s|$))/g)
  const fg = color.match(/(?<=(guifg=)).*?(?=(\s|$))/g)
  if (bg && bg[0]) res.bg = bg[0]
  if (fg && fg[0]) res.fg = fg[0]
  return res
}

class CustomFloatFactory extends FloatFactory {
  private DiffAdd: Color
  private DiffDelete: Color
  private CocFloatDividingLine: Color

  public async show(...args: any[]): Promise<void> {
    if (!this.DiffAdd) this.DiffAdd = await generateColor("DiffAdd")
    if (!this.DiffDelete) this.DiffDelete = await generateColor("DiffDelete")
    if (!this.CocFloatDividingLine) this.CocFloatDividingLine = await generateColor("CocFloatDividingLine")

    await workspace.nvim.command(`highlight DiffAdd guibg=NONE guifg=#9ed071`)
    await workspace.nvim.command(`highlight DiffDelete guibg=NONE guifg=#fc5f7e`)
    await workspace.nvim.command(`highlight CocFloatDividingLine guibg=NONE`)

    // @ts-expect-error
    await super.show(...args)
  }

  public close(): void {
    if (this.DiffAdd) {
      workspace.nvim.command(`highlight DiffAdd guibg=${this.DiffAdd.bg} guifg=${this.DiffAdd.fg}`)
    }
    if (this.DiffDelete) {
      workspace.nvim.command(`highlight DiffDelete guibg=${this.DiffDelete.bg} guifg=${this.DiffDelete.fg}`)
    }
    if (this.CocFloatDividingLine) {
      workspace.nvim.command(`highlight CocFloatDividingLine guibg=${this.CocFloatDividingLine.bg} guifg=${this.CocFloatDividingLine.fg}`)
    }
    super.close()
  }
}

export default CustomFloatFactory
