import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';


@Component({
  selector: 'app-finder',
  templateUrl: './finder.html',
  styleUrls: ['./finder.css']
})
export class FinderComponent {

  folderContent = new Array();
  currPath = 'C:';
  currParentId = '';
  prevParentId = '';

  constructor(private http: HttpClient) {
    this.http.get('http://localhost:3000/', {params:  new HttpParams().set('parent_id', '')}).subscribe(data => {
      const values = Object.values(data);
      if (data && values.length != 0){
        this.currParentId = values[0].parent_id;
        values.forEach(item => {
          this.folderContent.push(item);
          this.currParentId = item.parent_id;
        }); 
      }
  });
}


  onClick(item: any) {
    this.folderContent = [];
    let queryParam;

   

    if (item?.backward) {
      const lastIndex = this.currPath.lastIndexOf('\\');
      if (lastIndex === 0) {
        this.currPath = 'C:';
        this.currParentId = '';
        this.prevParentId = '';
      } else {
        this.currPath = this.currPath.slice(0, lastIndex);
        this.currParentId = this.prevParentId;
        this.prevParentId = item.parent_id;
      }
        queryParam = new HttpParams().set("parent_id", this.prevParentId);
    } 
    else {
      this.currParentId = item._id;
      this.prevParentId = item.parent_id;
      queryParam = new HttpParams().set('parent_id', this.currParentId);
      this.currPath += `\\${item.name}`
    }
    this.http.get('http://localhost:3000/', {params:  queryParam}).subscribe(data => {
      const values = Object.values(data);
      values.forEach(item => {
        this.folderContent.push(item);
      });  
    });
    this.folderContent.push({name: '..', item_type: "Directory", "parent_id": this.prevParentId, backward: true,})
  }
  
  addNewFolder() {
    const folderName = prompt('Enter a name for the new folder:');
    if (folderName) {
      this.folderContent = [];
      const newFolderParams = {"name": folderName, "parent_id": this.currParentId, "item_type": "Directory"};
      this.http.post('http://localhost:3000/add', newFolderParams).subscribe(data => {
        const values = Object.values(data);
        values.forEach(item => {
          this.folderContent.push(item);
          this.currParentId = item.parent_id;
        });   
       });
       this.folderContent.push({name: '..', item_type: "Directory", "parent_id": this.prevParentId,  backward: true})
    }
  }

  renameFile(item: any) {
    const newName = prompt('Enter a new name for the file: ', item.name);
    if (newName) {
      this.folderContent = [];
      const newFolderParams = {"_id": item._id, "name": newName, "parent_id": this.currParentId};
      this.http.put('http://localhost:3000/update', newFolderParams).subscribe(data => {
        const values = Object.values(data);
        values.forEach(item => {
          this.folderContent.push(item);
          this.currParentId = item.parent_id;
        });   
       });
    }
  }

  deleteFile(item: any ) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.folderContent = [];
      let queryParam;
      queryParam = new HttpParams().set('_id', item._id).set('parent_id', this.currParentId);
      this.http.delete('http://localhost:3000/remove', {params:  queryParam}).subscribe(data => {
        const values = Object.values(data);
        values.forEach(item => {
          this.folderContent.push(item);
          this.currParentId = item.parent_id;
        });
      });
    }
  }
}
