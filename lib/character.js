import Hanzi from './hanzi.js'

export default class {
  constructor(row) {
    for (var index in row) {
      this[index] = row[index]
    }
    this.animatedSvgLink = Hanzi.animatedSvgLink(row.character)
    this.parts = []
    var parts = this.decomposition.split('').filter(function(char) {
      return !Hanzi.isIdeographicDescCharacter(char)
    })
    var character = this
    parts.forEach(function(part) {
      var partObj = Hanzi.lookupShallow(part)
      if (partObj) {
        partObj.animatedSvgLink = Hanzi.animatedSvgLink(part)
      } else {
        partObj = {
          character: part
        }
      }
      partObj.animatedSvgLink = Hanzi.animatedSvgLink(part)
      character.parts.push(partObj)
    })
    this.decompositionTree = this._makeDecompositionTree()
  }
  _parentChildrenNotFull(currentNode) {
    return (
      currentNode.parent &&
      currentNode.parent.children.length <
        Hanzi.description[currentNode.parent.character].children.length
    )
  }
  _childrenFull(currentNode) {
    return (
      currentNode.children.length >=
      Hanzi.description[currentNode.character].children.length
    )
  }
  _makeDecompositionTree() {
    let root = {
      character: this.decomposition[0],
      type: 'description',
      children: []
    }
    let currentNode = root
    for (let char of this.decomposition.slice(1)) {
      const childNode = {
        character: char,
        parent: currentNode,
        children: []
      }

      if (this.isIdeographicDescCharacter(char)) {
        childNode.type = 'description'
        if (this._parentChildrenNotFull(currentNode)) {
          childNode.index = currentNode.parent.children.length // which one among the siblings = how many children we've already pushed
          childNode.parent = currentNode.parent
          currentNode.parent.children.push(childNode)
        } else {
          childNode.index = currentNode.children.length
          currentNode.children.push(childNode)
        }
        currentNode = childNode
      } else {
        childNode.type = 'character'
        if (childNode.character !== '？') {
          childNode.info = Hanzi.parts.find(function(part) {
            return part.part === childNode.character
          })
        }
        if (this._childrenFull(currentNode) && currentNode.parent) {
          childNode.index = currentNode.parent.children.length
          currentNode.parent.children.push(childNode)
          childNode.parent = currentNode.parent
          currentNode = currentNode.parent
        } else {
          childNode.index = currentNode.children.length
          currentNode.children.push(childNode)
        }
      }
    }
    return root
  }
  walkDecompositionTree(callback, node = this.decompositionTree) {
    const character = this
    callback(node)
    if (node.children.length > 0) {
      node.children.forEach(function(child) {
        character.walkDecompositionTree(callback, child)
      })
    }
  }
  isIdeographicDescCharacter(char) {
    if (char.replace(/[\u2ff0-\u2ffe]/, '') === '') {
      return true
    } else {
      return false
    }
  }
}
