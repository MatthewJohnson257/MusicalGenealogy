import { Component, HostListener } from '@angular/core';
import { Pianist } from '../pianist';
import { UPDATEDPLAYERS } from '../pianist';
import { ActivatedRoute, ChildrenOutletContexts } from '@angular/router';
import {Router} from "@angular/router"
import { Location, NgIfContext } from '@angular/common';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  selectedPianist: Pianist;
  parameterId : number;
  defaultPerson : number;
  previousPianist : Pianist;
  studentList : String = "";
  teacherList : String = "";
  teachersRows : [Pianist[]] = [[]];
  studentsRows : [Pianist[]] = [[]];
  pianistsVisited : Set<Number> = new Set();
  pianistsVisited2 : Set<Number> = new Set();
  teachersConnections : [[number[]]] = [[[]]];
  studentsConnections : [[number[]]] = [[[]]];
  isResizing : boolean;
  isDown : boolean = false;
  settingMaxGrandchildren : number;
  pianistList : Pianist [] = UPDATEDPLAYERS;



  constructor( private route: ActivatedRoute, private location: Location, private router: Router){

    if (!(Number(this.route.snapshot.paramMap.has('id')))){
      var tempDefaultPerson = localStorage.getItem("settingDefaultPerson");
      this.defaultPerson = tempDefaultPerson !== null ? parseInt(tempDefaultPerson) : 1;
      this.router.navigate(['/explore', this.defaultPerson, 0]);
    } else {
      localStorage.setItem("settingDefaultPerson", (Number(this.route.snapshot.paramMap.get('id'))).toString());
    }

    var tempDefaultPerson = localStorage.getItem("settingDefaultPerson");
    this.defaultPerson = tempDefaultPerson !== null ? parseInt(tempDefaultPerson) : 1;

    if (localStorage.getItem("settingMaxGrandchildren") === null){
      localStorage.setItem("settingMaxGrandchildren", "3");
    }
    var tempSetting = localStorage.getItem("settingMaxGrandchildren");
    this.settingMaxGrandchildren = tempSetting !== null ? parseInt(tempSetting) : 3;


    this.parameterId = Number(this.route.snapshot.paramMap.has('id')) ? Number(this.route.snapshot.paramMap.get('id')) : this.defaultPerson;
    this.selectedPianist = this.pianistList[0];
    this.previousPianist = this.selectedPianist;
    this.getSelectedStudents();
    this.getSelectedTeachers();

    this.dfsTeachers(this.parameterId, this.parameterId, 0);

    this.dfsStudents(Number(this.route.snapshot.paramMap.has('id')) ? Number(this.route.snapshot.paramMap.get('id')) : this.defaultPerson, Number(this.route.snapshot.paramMap.has('id')) ? Number(this.route.snapshot.paramMap.get('id')) : this.defaultPerson, Number(this.route.snapshot.paramMap.has('id')) ? Number(this.route.snapshot.paramMap.get('id')) : this.defaultPerson, 0);

    this.teachersRows.reverse();
    this.teachersConnections.reverse();
    this.isResizing = false;

  }

  
  mouseMoveHandler(e: MouseEvent, left: number, top: number, x: number, y: number){
    var scrollWindow = document.getElementById("parentScroll");
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    if(scrollWindow){
      scrollWindow.scrollTop = top - dy;
      scrollWindow.scrollLeft = left - dx;
    }
  }


  dfsTeachers(id : number, prevId : number, depth : number) : void {
    if (this.pianistsVisited.has(id)){
      return;
    }
    this.pianistsVisited.add(id);
    var currConnection = [id, prevId];

    if(this.teachersRows.length < depth + 1){
      this.teachersRows.push([]);
      this.teachersConnections.push([currConnection]);
    } else {
      this.teachersConnections[depth].push(currConnection);
    }
    var currTeacher = this.pianistList.find(pianist => pianist.id == id);
    if(currTeacher != null){
      this.teachersRows[depth].push(currTeacher);
    }

    if (depth > 0){
      currTeacher?.teachers?.slice(0, 4).forEach((nextId : number) => {
        this.dfsTeachers(nextId, id, depth + 1);
      });
    } else {
      currTeacher?.teachers?.forEach((nextId : number) => {
        this.dfsTeachers(nextId, id, depth + 1);
      });
    }

    return;
  }

  dfsStudents(origId : number, id : number, prevId : number, depth : number) : void {
    if (id != origId){
      if (this.pianistsVisited2.has(id)){
        return;
      }
    }
    this.pianistsVisited2.add(id);
    var currConnection = [id, prevId];
    if(this.studentsRows.length < depth + 1){
      this.studentsRows.push([]);
      this.studentsConnections.push([currConnection]);
    } else {
      this.studentsConnections[depth].push(currConnection);
    }

    var currStudent = this.pianistList.find(pianist => pianist.id == id);
    if(currStudent != null){
      this.studentsRows[depth].push(currStudent);
    }

    if(depth > 0) {
      currStudent?.students?.slice(0,this.settingMaxGrandchildren).forEach((nextId : number) => {
        this.dfsStudents(origId, nextId, id, depth + 1);
      })
    }
    else {
      currStudent?.students?.forEach((nextId : number) => {
        this.dfsStudents(origId, nextId, id, depth + 1);
      })
    }

    return;
  }

  drawTeacherSvgs() : void {
    var scrollWindow = document.getElementById("parentScroll");
    for (let i = 0; i < this.teachersConnections.length; i++){
      var currCanvasId = "canvas".concat(i.toString());
      var c = document.getElementById(currCanvasId);
      while (c?.lastElementChild){
        c.removeChild(c.lastElementChild);
      }
      var canvasCoords = c?.getBoundingClientRect();
      var buttons = document.getElementById("buttons".concat(i.toString()));
      var buttonsCoords = buttons?.getBoundingClientRect();

      for (let j = 0; j < this.teachersConnections[i].length; j++){
        if (this.teachersConnections[i][j].length == 2 && this.teachersConnections[i][j][0] != this.teachersConnections[i][j][1]){
          var teacherButton = document.getElementById("teacher".concat(this.teachersConnections[i][j][0].toString()));
          var studentButton = document.getElementById("teacher".concat(this.teachersConnections[i][j][1].toString()));
          var teacherCoords = teacherButton?.getBoundingClientRect();
          var studentCoords = studentButton?.getBoundingClientRect();
          if (teacherCoords != null && studentCoords != null && buttonsCoords != null && canvasCoords != null && scrollWindow){

            var newCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            var x1 = ((teacherCoords.left + teacherCoords.right - 0) / 2) + scrollWindow?.scrollLeft;
            var y1 = -3;
            var x2 = x1;
            var x4 = ((studentCoords.left + studentCoords.right - 0) / 2) + scrollWindow?.scrollLeft;
            var y4 = canvasCoords.height + 3;
            var y2 = y4 / 2;
            var x3 = x4;
            var y3 = y2;

            var attr = "M" + x1 + "," + y1 + " " + "C" + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x4 + "," + y4;

            newCurve.setAttribute("d", attr);
            newCurve.setAttribute("stroke", "red");
            newCurve.setAttribute("stroke-width", "5");
            newCurve.setAttribute("fill", "none");

            let colorString = "#";
            for (let i = 0; i < 3; i++){
              colorString += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
            }
            newCurve.style.stroke = colorString;
            newCurve.style.strokeWidth = "5px";
            
            c?.appendChild(newCurve);
          }
        }
      }
    }
  }

  drawStudentSvgs() : void {
    var scrollWindow = document.getElementById("parentScroll");
    for (let i = 1; i < this.studentsConnections.length; i++){
      var currCanvasId = "canvasStudent".concat((i-1).toString());
      var c = document.getElementById(currCanvasId);
      while (c?.lastElementChild){
        c.removeChild(c.lastElementChild);
      }
      var canvasCoords = c?.getBoundingClientRect();
      var buttons = document.getElementById("buttonsStudent".concat(i.toString()));
      var buttonsCoords = buttons?.getBoundingClientRect();

      for (let j = 0; j < this.studentsConnections[i].length; j++){
        if (this.studentsConnections[i][j].length == 2 && this.studentsConnections[i][j][0] != this.studentsConnections[i][j][1]){

          if(i < 2){
            var studentButton = document.getElementById("teacher".concat(this.studentsConnections[i][j][1].toString()));
          } else {
            var studentButton = document.getElementById("student".concat(this.studentsConnections[i][j][1].toString()));
          }
          var teacherButton = document.getElementById("student".concat(this.studentsConnections[i][j][0].toString()));
          var teacherCoords = teacherButton?.getBoundingClientRect();
          var studentCoords = studentButton?.getBoundingClientRect();
          if (studentCoords != null && teacherCoords != null && buttonsCoords != null && canvasCoords != null && scrollWindow){
            var newCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            var x1 = ((teacherCoords.left + teacherCoords.right - 0) / 2) + scrollWindow?.scrollLeft;
            var y1 = canvasCoords.height + 3;
            var x2 = x1;
            var y2 = y1 / 2;
            var x4 = ((studentCoords.left + studentCoords.right - 0) / 2) + scrollWindow?.scrollLeft;
            var y4 = -3;
            var x3 = x4;
            var y3 = y2;

            var attr = "M" + x1 + "," + y1 + " " + "C" + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x4 + "," + y4;

            newCurve.setAttribute("d", attr);
            newCurve.setAttribute("stroke", "red");
            newCurve.setAttribute("stroke-width", "5");
            newCurve.setAttribute("fill", "none");

            let colorString = "#";
            for (let i = 0; i < 3; i++){
              colorString += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
            }
            newCurve.style.stroke = colorString;
            newCurve.style.strokeWidth = "5px";
            
            c?.appendChild(newCurve);
          }
        }
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    var ua = navigator.userAgent;

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)){
      // do nothing
    } else {

      if(!this.isResizing){
        this.isResizing = true;
        setTimeout(() => {
          this.drawTeacherSvgs();
          this.drawStudentSvgs();
          this.isResizing = false;
        }, 0);
      }
    }

    var scrollWindow = document.getElementById("parentScroll");
    if(scrollWindow && scrollWindow?.scrollWidth < window.innerWidth){
      scrollWindow.style.cursor = "auto";
    } else {
      if(scrollWindow){
        scrollWindow.style.cursor = "grab";
      }
    }
  }


  ngAfterViewInit(): void {
    var scale = 'scale(1)';
    document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
    document.body.style.transform = scale;  

    this.drawTeacherSvgs();
    this.drawStudentSvgs();

    document.getElementById("teacher".concat(this.parameterId.toString()))?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
    });
    var ua = navigator.userAgent;

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)){
      if(Number(this.route.snapshot.paramMap.has('isRefresh') && this.route.snapshot.paramMap.has('id') && Number(this.route.snapshot.paramMap.get('isRefresh')) == 0)){
        this.router.navigate(['/explore', Number(this.route.snapshot.paramMap.get('id')), 1]);
        window.location.href = '/explore/' + Number(this.route.snapshot.paramMap.get('id')).toString() + '/1';
      }
    }
  


    var scrollWindow = document.getElementById("parentScroll");
    if(scrollWindow && scrollWindow?.scrollWidth < window.innerWidth){
      scrollWindow.style.cursor = "auto";
    }
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    if(scrollWindow){
      scrollWindow.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollWindow?.classList.add('active');
        if (scrollWindow){
          startX = e.pageX - scrollWindow?.offsetLeft;
          startY = e.pageY - window.pageYOffset;
        }
        scrollLeft  = scrollWindow?.scrollLeft ? scrollWindow?.scrollLeft : 0;
        scrollTop = document.documentElement?.scrollTop ? document.documentElement?.scrollTop : 0;

      });
      scrollWindow.addEventListener('mouseleave', () => {
        isDown = false;
        scrollWindow?.classList.remove('active');
      });
      scrollWindow.addEventListener('mouseup', () => {
        isDown = false;
        scrollWindow?.classList.remove('active');
      });
      scrollWindow.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        if(scrollWindow){
          const x = e.pageX - scrollWindow.offsetLeft;
          const walkX = (x - startX) * 2; //scroll-fast
          scrollWindow.scrollLeft = scrollLeft - walkX;

          var y = e.pageY - window.pageYOffset;

          var walkY = (y - startY) * 1;

        }
      });
    }
  }

  getSelectedStudents() : void {
    this.studentList = "";
    this.selectedPianist.students?.forEach(  (value : any) => {
      var student = this.pianistList.find(pianist => pianist.id == value);
      var studentName = student ? student.name : "";
      this.studentList = this.studentList.concat(studentName + ", ");
    });
    this.studentList = this.studentList.slice(0, -2);
  }

  getSelectedTeachers() : void {
    this.teacherList = "";
    this.selectedPianist.teachers?.forEach((value : any) => {
      var teacher = this.pianistList.find(pianist => pianist.id == value);
      var teacherName = teacher ? teacher.name : "";
      this.teacherList = this.teacherList.concat(teacherName + ", ");
    });
    this.teacherList = this.teacherList.slice(0, -2);
  }

  onHover(pianist : Pianist): void {
    this.previousPianist = this.selectedPianist;
    this.selectedPianist = pianist;
    this.getSelectedStudents();
    this.getSelectedTeachers();
  }

  offHover() : void {
    this.selectedPianist = this.previousPianist;
    this.getSelectedStudents();
    this.getSelectedTeachers();
  }

  clickPianist(pianist: Pianist): void {
    this.router.navigate(['/explore', pianist.id, 0]).then(() => { window.location.reload();});
  }


  onSelect(pianist : Pianist): void {
    this.selectedPianist = pianist;
    this.previousPianist = pianist;
    this.getSelectedStudents();
    this.getSelectedTeachers();
    this.router.navigate(['/explore', pianist.id]).then(() => { window.location.reload();});
  }

  coordsGet(el: any){
    var myElement = document.getElementById(el);
    var rect = myElement?.getBoundingClientRect();
  }

}
