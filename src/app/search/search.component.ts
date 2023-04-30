import { Component } from '@angular/core';
import { getPopperClassPlacement } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { Pianist } from '../pianist';
import { UPDATEDPLAYERS } from '../pianist';
import { Router } from "@angular/router"
import { Sort } from '@angular/material/sort';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  pianistList : Pianist [];

  page = 1;
  pageSize = 20;
  collectionSize : number;
  dummyVariable = "";

  constructor(private router : Router)
  {
    this.pianistList = UPDATEDPLAYERS.sort(function(a,b){ return a.name > b.name ? 1 : -1; });
    this.collectionSize = this.pianistList.length;
  }

  sortData(sort : Sort){
    const data = UPDATEDPLAYERS.sort(function(a,b){ return a.name > b.name ? 1 : -1; });
    if (!sort.active || sort.direction === '') {
      this.pianistList = UPDATEDPLAYERS;
      return;
    }


    this.pianistList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'birth':
          return compare(a.birth ? a.birth : 3000, b.birth ? b.birth : 3000, isAsc);
        case 'death':
          return compare(a.death ? a.death : 3000, b.death ? b.death : 3000, isAsc);
        default:
          return 0;
      }
    });
  }

  clickRow(pianist : Pianist) : void {
    this.router.navigate(['/explore', pianist.id, 0]);
  }

  filterStudents(): void {
    this.page = 1;
    this.pianistList = UPDATEDPLAYERS.filter(this.textFilter);
  }

  textFilter(person : Pianist) {
    var filterText = ((document.getElementById("searchText") as HTMLInputElement)?.value).toLowerCase();
    var personText = person.name.toLowerCase();
    return personText.includes(filterText);
  }

  getStudents(pianist : Pianist) : string {
    var studentList = "";

    pianist.students?.slice(0, 4).forEach((value : any) => {
      var student = UPDATEDPLAYERS.find(newStudent => newStudent.id == value);
      var studentName = student?.name;
      studentList = studentList.concat(studentName + ", ");
    })
    studentList = studentList.slice(0, -2);

    if (pianist.students){
      if (pianist.students.length > 4){
        studentList = studentList.concat(", ...");
      }
    }
    return studentList;
  }

  getTeachers(pianist : Pianist) : string {
    var teacherList = "";

    pianist.teachers?.slice(0, 4).forEach((value : any) => {
      var teacher = UPDATEDPLAYERS.find(newTeacher => newTeacher.id == value);
      var teacherName = teacher?.name;
      teacherList = teacherList.concat(teacherName + ", ");
    })
    teacherList = teacherList.slice(0, -2);

    if (pianist.teachers){
      if (pianist.teachers.length > 4){
        teacherList = teacherList.concat(", ...");
      }
    }
    return teacherList;
  }


}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
