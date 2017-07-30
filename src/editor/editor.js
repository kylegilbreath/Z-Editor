import React, {
    Component
} from 'react';
import {
    Map
} from 'immutable';
import { Editor } from 'react-draft-wysiwyg';
import './styles.css';
import '../App.css';
import TodoBlock from './TodoBlock';
import Schemata from './Schemata';
import SchemataUp from './SchemataUp';
import SchemataDown from './SchemataDown';
import SideToolBar from './sideToolBar';
import {
    EditorState,
    RichUtils
} from 'draft-js';
import {
    convertToRaw,
    convertFromRaw,
    Entity,
    Modifier,
    CompositeDecorator,
    DefaultDraftBlockRenderMap,
    AtomicBlockUtils,
    genKey,
    ContentBlock
} from 'draft-js';


const TODO_BLOCK = 'todo';
const SCHEMA = 'schemata';
const SCHEMA_UP = 'schemata_up';
const SCHEMA_DOWN = 'schemata_down';

const allData = [{id:0 , data:[{id: 0 , symbol: "Δ"},{id: 1 , symbol: "≙"},{id: 2 , symbol: "⨟"},{id: 3 , symbol: "⨠"},
{id: 4 , symbol: "Ξ"},{id: 5 , symbol: "⧹"},{id: 6 , symbol: "⨡"},{id: 7 , symbol: "pre"},{id: 8 , symbol: "′"},
{id: 9 , symbol: "θ"},{id: 10 , symbol: "⦉"},{id: 11 , symbol: "⦊"}]},
{id: 1 , data:[{id: 0 , symbol: "∧"},{id: 1 , symbol: "∨"},{id: 2 , symbol: "¬"},{id: 3 , symbol: "⇒"},
{id: 4 , symbol: "⊢"},{id: 5 , symbol: "∀"},{id: 6 , symbol: "∃"},{id: 7 , symbol: "∃1"},{id: 8 , symbol: "⇔"},
{id: 9 , symbol: "≠"}]},
{id: 2 , data:[{id: 0 , symbol: "∅"},{id: 1 , symbol: "ℙ"},{id: 2 , symbol: "ℙ1"},{id: 3 , symbol: "⦁"},
{id: 4 , symbol: "∈"},{id: 5 , symbol: "∉"},{id: 6 , symbol: "⊆"},{id: 7 , symbol: "⊂"},{id: 8 , symbol: "⟪"},
{id: 9 , symbol: "⟫"},{id: 10 , symbol: "∖"},{id: 11 , symbol: "⊖"},{id: 12 , symbol: "∪"},{id: 13 , symbol: "∩"},
{id: 14 , symbol: "⋃"},{id: 15 , symbol: "⋂"},]},
{id: 3 , data:[{id: 0 , symbol: "↔"},{id: 1 , symbol: "↦"},{id: 2 , symbol: "×"},{id: 3 , symbol: "⨾"},
{id: 4 , symbol: "∘"},{id: 5 , symbol: "⊕"},{id: 6 , symbol: "∼"},{id: 7 , symbol: "+"},{id: 8 , symbol: "*"},
{id: 9 , symbol: "⦇"},{id: 10 , symbol: "⦈"},{id: 11 , symbol: "◁"},{id: 12 , symbol: "▷"},{id: 13 , symbol: "⩤"},
{id: 14 , symbol: "⩥"}]},
{id: 4 , data:[{id: 0 , symbol: "⇸"},{id: 1 , symbol: "⤔"},{id: 2 , symbol: "⤀"},{id: 3 , symbol: "⤗"},
{id: 4 , symbol: "→"},{id: 5 , symbol: "↣"},{id: 6 , symbol: "↠"},{id: 7 , symbol: "⤖"},{id: 8 , symbol: "⇻"},
{id: 9 , symbol: "⤕"},{id: 10 , symbol: "λ"},{id: 11 , symbol: "μ"}]},
{id: 5 , data:[{id: 0 , symbol: "ℤ"},{id: 1 , symbol: "ℚ"},{id: 2 , symbol: "ℝ"},{id: 3 , symbol: "ℕ"},
{id: 4 , symbol: "ℕ1"},{id: 5 , symbol: "≤"},{id: 6 , symbol: "≥"},{id: 7 , symbol: "÷"},{id: 8 , symbol: "−"},
{id: 9 , symbol: "mod"}]},
{id: 6 , data:[{id: 0 , symbol: "⟨"},{id: 1 , symbol: "⟩"},{id: 2 , symbol: "↿"},{id: 3 , symbol: "↾"},
{id: 4 , symbol: "⁀"},{id: 5 , symbol: "⁀/"}]},
{id: 7 , data:[{id: 0 , symbol: "⟦"},{id: 1 , symbol: "⟧"},{id: 2 , symbol: "⊎"},{id: 3 , symbol: "⩁"},
{id: 4 , symbol: "⊗"},{id: 5 , symbol: "⋿"},{id: 6 , symbol: "⊑"},{id: 7 , symbol: "♯"}]},
];

const allData_left = [{id: 100 , type: "main"},{id: 101 , type: "half"},{id: 102 , type: "bar"},{id: 103 , type: "inverse"}];

const convertBlock = (type,editorState, selectionState, contentState) => {

    const newType = type;
    // const editorState = this.state.editorState;
    // const contentState = editorState.getCurrentContent();
    // const selectionState = editorState.getSelection();
    const key = selectionState.getStartKey();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(key);
    const newText = block.getText();
    const newBlock = block.merge({
        text: newText,
        type: newType,
        data: getDefaultBlockData(newType),
    });
    const newContentState = contentState.merge({
        blockMap: blockMap.set(key, newBlock),
        selectionAfter: selectionState.merge({
            anchorOffset: 0,
            focusOffset: 0,
        }),
    });

    return newBlock;
}

const generate_block = (style) => {
    const newBlockKey = genKey();
    const block  = new ContentBlock({
            key: newBlockKey,
            type: style,
            text: ''
        });
    return [newBlockKey,block];
}


const insert_schemata = (editorState, selection, contentState, currentBlock, type) => {
    
    const newBlock = convertBlock('schemata_up',editorState, selection, contentState);
    const blockMap = contentState.getBlockMap();
    // Split the blocks
    const blocksBefore = blockMap.toSeq().takeUntil(function (v) {
        return v === currentBlock
    })
    const blocksAfter = blockMap.toSeq().skipUntil(function (v) {
        return v === currentBlock
    }).rest()

    let newBlocks = [];

    switch (type) {
            case 'half':
                newBlocks =[
                    generate_block('unstyled'),
                    [currentBlock.getKey(), newBlock],
                    generate_block('schemata'),     
                    generate_block('schemata_down'),
                    generate_block('unstyled')
                ];
                break;
            case 'main':
                newBlocks =[
                    generate_block('unstyled'),
                    [currentBlock.getKey(), newBlock],
                    generate_block('schemata'),     
                    generate_block('schemata_down'),
                    generate_block('schemata'),
                    generate_block('schemata'),
                    generate_block('schemata_down'),
                    generate_block('unstyled')
                ];
                break;
            case 'bar':
                newBlocks = [
                    generate_block('unstyled'),
                    [currentBlock.getKey(), convertBlock('schemata',editorState, selection, contentState)],
                    generate_block('unstyled')
                ];
                break;
            case 'inverse':
                newBlocks = [
                    generate_block('unstyled'),
                    [currentBlock.getKey(), convertBlock('schemata',editorState, selection, contentState)],
                    generate_block('schemata_down'),
                    generate_block('schemata'),
                    generate_block('unstyled')
                ];
                break;
            default:
                null;
    }

    const newBlockMap = blocksBefore.concat(newBlocks, blocksAfter).toOrderedMap()
    const newContentState = contentState.merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection,
    })
    return EditorState.push(editorState, newContentState, 'insert-fragment');

}

/*
    Returns default block-level metadata for various block type. Empty object otherwise.
    */
const getDefaultBlockData = (blockType, initialData = {}) => {
    switch (blockType) {
        case TODO_BLOCK:
            return {
                checked: false
            };
        default:
            return initialData;
    }
};

/*
Changes the block type of the current block.
*/
const resetBlockType = (editorState, newType = 'unstyled') => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const key = selectionState.getStartKey();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(key);
    let newText = '';
    const text = block.getText();
    if (block.getLength() >= 2) {
        newText = text.substr(1);
    }
    const newBlock = block.merge({
        text: newText,
        type: newType,
        data: getDefaultBlockData(newType),
    });
    const newContentState = contentState.merge({
        blockMap: blockMap.set(key, newBlock),
        selectionAfter: selectionState.merge({
            anchorOffset: 0,
            focusOffset: 0,
        }),
    });
    return EditorState.push(editorState, newContentState, 'change-block-type');
};

/*
A higher-order function. http://bitwiser.in/2016/08/31/implementing-todo-list-in-draft-js.html
*/
const getBlockRendererFn = (getEditorState, onChange) => (block) => {
    const type = block.getType();
    switch (type) {
        case 'atomic':
            return {
                component: TodoBlock,
                props: {
                    getEditorState,
                    onChange,
                },
                };
        case 'todo':
            return {
                component: TodoBlock,
                props: {
                    getEditorState,
                    onChange,
                },
            };
        case 'schemata':
            return {
                component: Schemata,
                props: {
                    getEditorState,
                    onChange,
                },
            };
        case 'schemata_up':
            return {
                component: SchemataUp,
                props: {
                    getEditorState,
                    onChange,
                },
            };
        case 'schemata_down':
            return {
                component: SchemataDown,
                props: {
                    getEditorState,
                    onChange,
                },
            };        
        default:
            return null;
    }
};

class ZEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState: EditorState.createEmpty()
        };

        /* blockRenderMap */
        this.blockRenderMap = Map({
            [TODO_BLOCK]: {
                element: 'div',
            },
            [SCHEMA]: {
                element: 'div',
            },
            [SCHEMA_UP]: {
                element: 'div',
            },
            [SCHEMA_DOWN]: {
                element: 'div',
            },
        }).merge(DefaultDraftBlockRenderMap);


        this.onEditorStateChange = (editorState) => {
            this.setState({
            editorState,
            });
        }
        // this.onChange = (editorState) => this.setState({
        //     editorState
        // });

        this.handleBeforeInput = this.handleBeforeInput.bind(this);

        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        // Get a blockRendererFn from the higher-order function.
        this.blockRendererFn = getBlockRendererFn(
            this.getEditorState, this.onEditorStateChange);

        this.onUserClick = this.insert_schema.bind(this);

    }

    componentDidMount() {
        // this.refs.editor.focus();
    }

    // componentDidMount(){
    //     console.log(this.domEditor);
    //     this.domEditor.focus()
    // }

    blockStyleFn(block) {
        switch (block.getType()) {
            case 'atomic':
                return 'block block-todo';
            case TODO_BLOCK:
                return 'block block-todo';
            case SCHEMA:
                return 'schemata';
            case SCHEMA_UP:
                return 'schemata_up';
            case SCHEMA_DOWN:
                return 'schemata_down';    
            default:
                return 'block';
        }
    }

    insertFN = (symbol,type,side) => {
        if (type){
            this.insert_schema(type);
        }
        else{
            this.insertSymbol(symbol);
        }

    }

    insert_schema = (type) => {
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const key = selectionState.getStartKey();
        const blockMap = contentState.getBlockMap();
        const block = blockMap.get(key);

        this.setState({
            editorState: insert_schemata(editorState, selectionState, contentState, block, type )
        }, () => {
            // this.refs.editor.focus();
        });
    }

    insertPlaceholder = (type) => {

        /// convert current block :) 
        const newType = type;
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const key = selectionState.getStartKey();
        const blockMap = contentState.getBlockMap();
        const block = blockMap.get(key);
        let newText = '';
        const text = block.getText();
        if (block.getLength() >= 2) {
            newText = text.substr(1);
        }
        const newBlock = block.merge({
            text: newText,
            type: newType,
            data: getDefaultBlockData(newType),
        });
        const newContentState = contentState.merge({
            blockMap: blockMap.set(key, newBlock),
            selectionAfter: selectionState.merge({
                anchorOffset: 0,
                focusOffset: 0,
            }),
        });

        this.setState({
            editorState: EditorState.push(editorState, newContentState, 'change-block-type')
        }, () => {
            // this.refs.editor.focus();
        });


        // typical method of creating an entity and add it to the blocks

        // const label = "|----------------------------- \n|makeMilkCoffee \n|ΔtheCoffeeMachine \n|coffee? : ℕ \n|milk? : ℕ \n|------------------------- \n|coffee   0 \n|milk   0 \n|coffee  halfCupCapacity \n|milk  halfCupCapacity \n|------------------------- \n "
        // const meta = "na"
        // const editorState = this.state.editorState;

        // // const selectionState = editorState.getSelection();
        // const contentState = editorState.getCurrentContent();

        // const contentStateWithEntity = contentState.createEntity(
        // 'todo',
        // 'MUTABLE',{
        //     text:meta
        // }
        // );
        // const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        // const newEditorState = EditorState.set(
        //     editorState,
        //     { currentContent: contentStateWithEntity }
        // );

        // const newEditorStateWithBlock = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
        // this.setState({ TODO_BLOCK: Map() , editorState: newEditorStateWithBlock });

        ////////////////////////////////////////////////
        // const newContentState = Modifier.applyEntity(
        // contentState,
        // selectionState,
        // entityKey
        // );

        // this.setState({
        //     editorState: EditorState.push(editorState, textWithEntity, 'insert-characters')
        // }, () => {
        //     this.refs.editor.focus();
        // });
        // associate the text in the selection (from - to) to the entety and get a new content state
        // const newContentState = Modifier.insertText(contentState, selectionState, 'test', null, entityKey);

        // insert a new atomic block with the entity and a whit space as the text

        

        // this.setState({
        //     editorState: EditorState.push(editorState, newContentState, 'apply-entity')
        // }, () => {
        //     this.refs.editor.focus();
        // });
    }

    insertSymbol = (symbol)=>{
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const newContentState = Modifier.insertText(contentState, selectionState, symbol, null, null);

        this.setState({
            editorState: EditorState.push(editorState, newContentState, 'add-text')
        }, () => {
            // this.refs.editor.focus();
        });
    }

    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onEditorStateChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }


    /* Add this as a method inside MyTodoListEditor */

    handleBeforeInput(str) {
        if (str !== ']') {
            return false;
        }
        const {
            editorState
        } = this.state;
        /* Get the selection */
        const selection = editorState.getSelection();

        /* Get the current block */
        const currentBlock = editorState.getCurrentContent()
            .getBlockForKey(selection.getStartKey());
        const blockType = currentBlock.getType();
        const blockLength = currentBlock.getLength();
        if (blockLength === 1 && currentBlock.getText() === '[') {
            this.onEditorStateChange(resetBlockType(editorState, blockType !== TODO_BLOCK ? TODO_BLOCK : 'unstyled'));
            return true;
        }
        return false;
    }


    render() {
        const bar = allData.map((btn) => {
                return (
                
                    <SideToolBar side={"right"} data={btn.data} key={btn.id} insertFn={this.insertFN}/>
                
                )
            });

        return ( 
            
            <div className = "container-content">

                <ul className="menu">{bar}</ul>
                <ul className="menu_left"><SideToolBar side={"left"} data={allData_left} insertFn={this.insertFN}/></ul>

                <div>              
                    <div>                
                        <Editor
                        editorState={this.state.editorState}
                        onEditorStateChange={this.onEditorStateChange}
                        blockStyleFn = {this.blockStyleFn}
                        blockRenderMap = {this.blockRenderMap}
                        blockRendererFn = {this.blockRendererFn}
                        handleKeyCommand = {this.handleKeyCommand}
                        handleBeforeInput = {this.handleBeforeInput}
                        editorClassName="page"
                        />
                    </div> 
                </div>
                <div>
                    <button onClick={this.insert_schema}> {'insert'}</button>
                    JSON
                    <pre >{JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()), null, 1)}</pre>
                </div>
            </div>
        );
    }
}
export default ZEditor;