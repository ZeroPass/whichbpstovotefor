// Object modeling a proposal/question
export class Proposal {

    name: string;
    title: string;
    content: string;

    constructor(name, title, content){
        this.name = name;
        this.title = title;
        this.content = content;
    }
}