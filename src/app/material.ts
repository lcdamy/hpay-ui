
import { MatButtonModule,MatCheckboxModule,MatDividerModule,MatListModule,MatGridListModule } from '@angular/material';
import { NgModule } from '@angular/core';

@NgModule({
    imports:[
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatListModule,
        MatGridListModule
    ],
    exports:[
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatListModule,
        MatGridListModule
    ]
})
export class MaterialModule {}